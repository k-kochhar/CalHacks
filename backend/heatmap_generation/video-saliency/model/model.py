"""
Baseten/Truss Model Wrapper for Video Saliency Detection + Foveated Rendering
===============================================================================

This model processes videos to detect salient regions (areas that draw attention),
extracts focal points, and optionally generates foveated rendered video using GPU-accelerated
OpenGL shaders. The foveated rendering uses detected focal points as foveal centers.

Expected Input:
    {
        "video_url": "https://...",         # OR
        "video_base64": "...",               # base64 encoded video
        "output_format": "json",             # "json" (focal points only) or "foveated_video" (JSON + rendered video)
        "device": "auto"                     # "auto", "cuda", "mps", or "cpu"
    }

Output (output_format="json"):
    {
        "video_info": {
            "width": int,
            "height": int,
            "fps": float,
            "total_frames": int
        },
        "focal_points": [
            {
                "frame_index": int,
                "points": [
                    {
                        "x": float,
                        "y": float,
                        "radius": float,
                        "intensity": float
                    },
                    ...
                ]
            },
            ...
        ],
        "performance_metrics": {...}
    }

Output (output_format="foveated_video"):
    Same as above, plus:
    {
        "foveated_video_url": "https://salient-labs-videos.s3.amazonaws.com/foveated/{id}.mp4",
        "performance_metrics": {
            ...
            "avg_foveated_rendering_ms_per_frame": float
        }
    }
"""

import os
import tempfile
import base64
import requests
import time
from pathlib import Path
from collections import defaultdict
from uuid import uuid4

import torch
import cv2
import numpy as np
from scipy import ndimage
import moderngl
import boto3
from botocore.exceptions import ClientError

from vinet_model.Vinet_S_model import VideoSaliencyModel


class FoveatedRenderer:
    """
    ModernGL-based GPU renderer for multi-foveated shading.
    Simplified version integrated into the saliency pipeline.
    """

    def __init__(
        self,
        model_dir: Path,
        stride: int,
        thresh1: float,
        thresh2: float,
        thresh3: float,
    ):
        # Force EGL backend for headless rendering (no X11 display needed)
        # This is required for containerized/cloud environments
        try:
            print("  Attempting to create EGL context (headless)...")
            self.ctx = moderngl.create_standalone_context(backend="egl")
            print("  ✅ EGL context created successfully")
        except Exception as e:
            print(f"  ⚠️  EGL context failed: {e}")
            print("  Trying default backend...")
            # Fallback to default (might work with Xvfb or other setups)
            self.ctx = moderngl.create_standalone_context()
            print("  ✅ Default context created successfully")

        self.stride = stride
        self.thresh1 = thresh1
        self.thresh2 = thresh2
        self.thresh3 = thresh3

        # Load shaders
        shader_dir = model_dir / "shaders"
        vert_path = shader_dir / "vertex_shader.glsl"
        frag_path = shader_dir / "foveated_render_multi.glsl"

        with open(vert_path, "r") as f:
            vert_src = f.read()
        with open(frag_path, "r") as f:
            frag_src = f.read()

        self.prog = self.ctx.program(vertex_shader=vert_src, fragment_shader=frag_src)

    def render(self, frame: np.ndarray, centers: list) -> np.ndarray:
        """
        Apply foveated shading to a frame using detected focal points.

        Args:
            frame: RGB frame (numpy array)
            centers: List of (x, y) tuples for foveal centers

        Returns:
            Foveated rendered frame
        """
        h, w = frame.shape[:2]
        num = min(len(centers), 3)

        # Texture + framebuffer setup
        tex = self.ctx.texture((w, h), 3, frame.tobytes())
        tex.use(location=0)
        fbo = self.ctx.simple_framebuffer((w, h))
        fbo.use()

        # Bind uniforms
        if "iResolution" in self.prog:
            self.prog["iResolution"].value = (w, h)
        if "tex" in self.prog:
            self.prog["tex"].value = 0
        if "stride" in self.prog:
            self.prog["stride"].value = self.stride

        # Scale thresholds by diagonal
        diag = 0.5 * (w + h)
        for name in ["thresh1", "thresh2", "thresh3"]:
            if name in self.prog:
                val = getattr(self, name)
                self.prog[name].value = val * diag

        # Multi-fovea uniforms
        if "numFoveae" in self.prog:
            self.prog["numFoveae"].value = num

        uniform_names = ["foveaCenter0", "foveaCenter1", "foveaCenter2"]
        for i in range(3):
            cx, cy = centers[i] if i < num else (0.0, 0.0)
            if uniform_names[i] in self.prog:
                self.prog[uniform_names[i]].value = (float(cx), float(cy))

        # Fullscreen quad
        vertices = np.array(
            [
                -1.0,
                1.0,
                0.0,
                0.0,
                1.0,
                1.0,
                1.0,
                0.0,
                1.0,
                1.0,
                1.0,
                -1.0,
                0.0,
                1.0,
                0.0,
                -1.0,
                -1.0,
                0.0,
                0.0,
                0.0,
            ],
            dtype="f4",
        )

        indices = np.array([0, 1, 2, 2, 3, 0], dtype="i4")
        vbo = self.ctx.buffer(vertices)
        ibo = self.ctx.buffer(indices)
        vao_content = [(vbo, "3f 2f", "position", "inTexCoord")]
        vao = self.ctx.vertex_array(self.prog, vao_content, ibo)

        # Render
        vao.render()

        # Read result
        result = np.frombuffer(fbo.read(components=3), dtype=np.uint8).reshape(
            (h, w, 3)
        )

        # Cleanup
        vao.release()
        vbo.release()
        ibo.release()
        fbo.release()
        tex.release()

        return result


class Model:
    def __init__(self, **kwargs):
        """
        Initialize the model wrapper.
        This runs when the model server starts.
        """
        self._data_dir = kwargs.get("data_dir")
        self._config = kwargs.get("config", {})
        self._secrets = kwargs.get("secrets", {})

        self._model = None
        self._device = None
        self._num_devices = 0
        self._device_ids = []

        self.PEAK_THRESHOLD = 0.5
        self.MIN_DISTANCE_PIXELS = 50
        self.MAX_FOCAL_POINTS = 5
        self.RADIUS_INTENSITY_THRESHOLD = 0.5
        self.MIN_RADIUS_PIXELS = 30
        self.MAX_RADIUS_PIXELS = 300
        self.GAUSSIAN_KERNEL_SIZE = 11
        self.GAUSSIAN_SIGMA = 0

        self.CLIP_SIZE = 32
        self.MODEL_HEIGHT = 224
        self.MODEL_WIDTH = 384

        # Foveated rendering parameters
        self.FOVEATED_STRIDE = 4
        self.FOVEATED_THRESH1 = 0.10
        self.FOVEATED_THRESH2 = 0.25
        self.FOVEATED_THRESH3 = 0.40

        self._foveated_renderer = None

        # S3 configuration
        self.S3_BUCKET = "salient-labs-videos"
        self.S3_REGION = os.environ.get("AWS_REGION", "us-east-1")
        self._s3_client = None

    def load(self):
        """
        Load the video saliency model and checkpoint.
        This runs exactly once when the model server is spun up.
        """
        print("Loading Video Saliency Model...")

        if torch.cuda.is_available():
            self._num_devices = torch.cuda.device_count()
            self._device_ids = list(range(self._num_devices))
            self._device = torch.device("cuda:0")
            print(f"🚀 Found {self._num_devices} CUDA GPU(s)")
            for i in range(self._num_devices):
                print(f"   GPU {i}: {torch.cuda.get_device_name(i)}")
        elif torch.backends.mps.is_available():
            self._device = torch.device("mps")
            self._num_devices = 1
            self._device_ids = [0]
            print("Using Apple Silicon GPU (MPS)")
        else:
            self._device = torch.device("cpu")
            self._num_devices = 1
            self._device_ids = [0]
            print("Using CPU")

        self._model = VideoSaliencyModel()

        checkpoint_path = (
            Path(self._data_dir) / "checkpoints" / "vinet_s_mvva_randomsplit.pt"
        )

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"Model checkpoint not found at {checkpoint_path}. "
                "Please ensure the checkpoint file is in data/checkpoints/"
            )

        print(f"Loading checkpoint from {checkpoint_path}")
        state_dict = torch.load(
            checkpoint_path, map_location=self._device, weights_only=True
        )
        self._model.load_state_dict(state_dict)
        self._model.to(self._device)
        self._model.eval()

        self._checkpoint_path = str(checkpoint_path)

        # Initialize foveated renderer (optional - don't fail if it doesn't work)
        print("Initializing foveated renderer...")
        try:
            model_dir = Path(__file__).parent
            print(f"  Model directory: {model_dir}")
            print(f"  Looking for shaders in: {model_dir / 'shaders'}")

            self._foveated_renderer = FoveatedRenderer(
                model_dir=model_dir,
                stride=self.FOVEATED_STRIDE,
                thresh1=self.FOVEATED_THRESH1,
                thresh2=self.FOVEATED_THRESH2,
                thresh3=self.FOVEATED_THRESH3,
            )
            print("✅ Foveated renderer initialized successfully!")
        except Exception as e:
            print(f"⚠️  WARNING: Could not initialize foveated renderer: {e}")
            print(f"   Error type: {type(e).__name__}")
            print("   Foveated video generation will not be available.")
            print("   The model will still work for focal point detection only.")
            self._foveated_renderer = None

        # Initialize S3 client
        print("Initializing S3 client...")
        try:
            aws_key = os.environ.get("AWS_ACCESS_KEY_ID")
            print(f"  AWS_ACCESS_KEY_ID present: {bool(aws_key)}")

            self._s3_client = boto3.client(
                "s3",
                region_name=self.S3_REGION,
                aws_access_key_id=aws_key,
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
            )
            print(f"✅ S3 client initialized for bucket: {self.S3_BUCKET}")
        except Exception as e:
            print(f"⚠️  WARNING: Could not initialize S3 client: {e}")
            print(f"   Error type: {type(e).__name__}")
            print("   Foveated video uploads will not be available.")
            self._s3_client = None

        print("✅ Model loaded successfully!")
        if self._foveated_renderer:
            print("   - Foveated rendering: ENABLED")
        else:
            print("   - Foveated rendering: DISABLED (OpenGL context failed)")
        if self._s3_client:
            print("   - S3 uploads: ENABLED")
        else:
            print("   - S3 uploads: DISABLED (credentials not configured)")

    def _upload_to_s3(self, file_path: str, s3_key: str) -> str:
        """
        Upload a file to S3 and return the URL.

        Args:
            file_path: Local path to the file to upload
            s3_key: S3 key (path) where the file should be stored

        Returns:
            Public S3 URL of the uploaded file
        """
        if not self._s3_client:
            raise RuntimeError(
                "S3 client not initialized. Check AWS credentials in environment variables."
            )

        try:
            print(f"📤 Uploading to S3: {s3_key}")
            with open(file_path, "rb") as f:
                self._s3_client.upload_fileobj(
                    f,
                    self.S3_BUCKET,
                    s3_key,
                    ExtraArgs={"ContentType": "video/mp4"},
                )

            s3_url = f"https://{self.S3_BUCKET}.s3.amazonaws.com/{s3_key}"
            print(f"✅ Uploaded to: {s3_url}")
            return s3_url

        except ClientError as e:
            print(f"❌ S3 upload failed: {e}")
            raise

    def predict(self, model_input):
        """
        Run inference on input video and extract focal points, with optional foveated rendering.

        Args:
            model_input: Dictionary containing:
                - video_url: URL to download video from, OR
                - video_base64: Base64 encoded video data
                - output_format: "json" (default - focal points only), "foveated_video" (JSON + video)
                - device: Device override (optional)

        Returns:
            Dictionary with video info, focal points, performance metrics, and optionally foveated video
        """
        start_time = time.time()

        video_url = model_input.get("video_url")
        video_base64 = model_input.get("video_base64")
        output_format = model_input.get("output_format", "json")
        generate_foveated = output_format == "foveated_video"

        if not video_url and not video_base64:
            return {
                "error": "Must provide either 'video_url' or 'video_base64' in input"
            }

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
            tmp_video_path = tmp_file.name

            try:
                download_start = time.time()
                if video_url:
                    print(f"Downloading video from {video_url}")
                    response = requests.get(video_url, timeout=30)
                    response.raise_for_status()
                    tmp_file.write(response.content)
                else:
                    print("Decoding base64 video")
                    video_data = base64.b64decode(video_base64)
                    tmp_file.write(video_data)

                tmp_file.flush()
                download_time = time.time() - download_start
                print(f"⏱️  Video download/decode: {download_time:.2f}s")

                result = self._process_video(
                    tmp_video_path, download_time, generate_foveated
                )

                total_time = time.time() - start_time
                result["performance_metrics"]["total_time_seconds"] = round(
                    total_time, 2
                )

                print(f"⏱️  Total processing time: {total_time:.2f}s")

                return result

            except Exception as e:
                return {"error": f"Error processing video: {str(e)}"}
            finally:
                try:
                    os.unlink(tmp_video_path)
                except:
                    pass

    def _process_video(self, video_path, download_time, generate_foveated=False):
        """
        Internal method to process video and extract focal points.
        Optionally generates foveated rendered video.
        """
        process_start = time.time()

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file")

        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.release()

        input_resolution = f"{width}x{height}"
        model_resolution = f"{self.MODEL_WIDTH}x{self.MODEL_HEIGHT}"

        print(f"📹 Video: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")
        print(
            f"🔄 Will resize from {input_resolution} to {model_resolution} for inference"
        )

        focal_points_data = {
            "video_info": {
                "width": width,
                "height": height,
                "fps": fps,
                "total_frames": total_frames,
                "input_resolution": input_resolution,
                "model_resolution": model_resolution,
            },
            "focal_points": [],
            "performance_metrics": {
                "device": str(self._device),
                "download_decode_time_seconds": round(download_time, 2),
            },
        }

        # Use single-device streaming mode with optional foveated rendering
        print(
            f"💾 Using single-device streaming mode with foveated rendering: {generate_foveated}"
        )
        result = self._process_video_single(
            video_path, width, height, total_frames, fps, generate_foveated
        )

        focal_points_data["focal_points"] = result["focal_points"]
        focal_points_data["performance_metrics"].update(result["metrics"])

        # Add foveated video URL if generated
        if "foveated_video_url" in result:
            focal_points_data["foveated_video_url"] = result["foveated_video_url"]

        return focal_points_data

    def _process_video_single(
        self, video_path, width, height, total_frames, fps, generate_foveated=False
    ):
        """
        Process video using single device with streaming.
        Optionally generates foveated rendered video.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file")

        # Check if foveated rendering is available
        if generate_foveated and not self._foveated_renderer:
            print("⚠️  Foveated rendering requested but renderer not available!")
            print("   Falling back to JSON-only output.")
            generate_foveated = False

        # Set up video writer if generating foveated output
        video_writer = None
        tmp_output_path = None
        if generate_foveated:
            tmp_output_path = tempfile.NamedTemporaryFile(
                suffix=".mp4", delete=False
            ).name
            fourcc = cv2.VideoWriter_fourcc(*"avc1")
            video_writer = cv2.VideoWriter(
                tmp_output_path, fourcc, fps, (width, height)
            )
            if not video_writer.isOpened():
                raise ValueError("Could not initialize VideoWriter for foveated output")
            print(f"🎬 Writing foveated video to {tmp_output_path}")

        inference_start = time.time()
        preprocessing_times = []
        model_inference_times = []
        postprocessing_times = []
        rendering_times = []
        focal_points_list = []

        clip_buffer = []
        frame_idx = 0
        first_frame = None

        with torch.no_grad():
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx == 0:
                    first_frame = frame.copy()

                clip_buffer.append(frame)
                if len(clip_buffer) > self.CLIP_SIZE:
                    clip_buffer.pop(0)

                current_clip = clip_buffer.copy()
                if len(current_clip) < self.CLIP_SIZE:
                    padding = [first_frame] * (self.CLIP_SIZE - len(current_clip))
                    current_clip = padding + current_clip

                focal_points, preprocess_time, inference_time, postprocess_time = (
                    self._process_single_frame(
                        current_clip, width, height, self._model, self._device
                    )
                )

                preprocessing_times.append(preprocess_time)
                model_inference_times.append(inference_time)
                postprocessing_times.append(postprocess_time)

                focal_points_list.append(
                    {
                        "frame_index": frame_idx,
                        "points": [fp.to_dict() for fp in focal_points],
                    }
                )

                # Apply foveated rendering if requested
                if generate_foveated and video_writer is not None:
                    render_start = time.time()

                    # Extract centers from focal points (up to 3)
                    centers = [(fp.x, fp.y) for fp in focal_points[:3]]
                    if not centers:
                        # If no focal points, use center of frame
                        centers = [(width / 2, height / 2)]

                    # Convert BGR to RGB for renderer
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                    # Render foveated frame
                    foveated_frame_rgb = self._foveated_renderer.render(
                        frame_rgb, centers
                    )

                    # Convert back to BGR for video writer
                    foveated_frame_bgr = cv2.cvtColor(
                        foveated_frame_rgb, cv2.COLOR_RGB2BGR
                    )
                    video_writer.write(foveated_frame_bgr)

                    rendering_times.append(time.time() - render_start)

                frame_idx += 1

                if frame_idx % 10 == 0 or frame_idx == total_frames:
                    elapsed = time.time() - inference_start
                    fps_processing = frame_idx / elapsed
                    print(
                        f"⏱️  Processed {frame_idx}/{total_frames} frames | {fps_processing:.2f} FPS"
                    )

        cap.release()

        # Finalize and upload video if generated
        foveated_video_url = None
        if generate_foveated and video_writer is not None:
            video_writer.release()
            print(f"✅ Foveated video written to {tmp_output_path}")

            # Upload to S3
            try:
                video_id = str(uuid4())
                s3_key = f"foveated/{video_id}.mp4"
                foveated_video_url = self._upload_to_s3(tmp_output_path, s3_key)

                # Get file size for metrics
                file_size_mb = os.path.getsize(tmp_output_path) / (1024 * 1024)
                print(f"📊 Foveated video size: {file_size_mb:.2f} MB")

            except Exception as e:
                print(f"❌ Failed to upload foveated video to S3: {e}")
                # Don't fail the entire request, just log the error

            finally:
                # Clean up temp file
                try:
                    os.unlink(tmp_output_path)
                except:
                    pass

        total_inference_time = time.time() - inference_start
        avg_preprocess = np.mean(preprocessing_times) * 1000
        avg_inference = np.mean(model_inference_times) * 1000
        avg_postprocess = np.mean(postprocessing_times) * 1000
        processing_fps = frame_idx / total_inference_time

        metrics = {
            "total_inference_time_seconds": round(total_inference_time, 2),
            "frames_per_second": round(processing_fps, 2),
            "avg_preprocessing_ms_per_frame": round(avg_preprocess, 2),
            "avg_model_inference_ms_per_frame": round(avg_inference, 2),
            "avg_postprocessing_ms_per_frame": round(avg_postprocess, 2),
            "avg_total_ms_per_frame": round(
                avg_preprocess + avg_inference + avg_postprocess, 2
            ),
            "memory_optimization": f"Streaming mode - max {self.CLIP_SIZE} frames in memory",
        }

        if rendering_times:
            avg_rendering = np.mean(rendering_times) * 1000
            metrics["avg_foveated_rendering_ms_per_frame"] = round(avg_rendering, 2)
            metrics["foveated_rendering_enabled"] = True

        print(f"\n📊 Single-Device Performance Summary:")
        print(f"   Device: {self._device}")
        print(f"   Frames: {frame_idx}")
        print(f"   Processing FPS: {processing_fps:.2f}")
        if rendering_times:
            print(f"   Avg Rendering Time: {avg_rendering:.2f}ms/frame")

        result = {"focal_points": focal_points_list, "metrics": metrics}
        if foveated_video_url:
            result["foveated_video_url"] = foveated_video_url

        return result

    def _process_single_frame(self, clip, width, height, model, device):
        """
        Process a single frame with its temporal context (clip).

        Args:
            clip: List of CLIP_SIZE frames (current frame and its temporal context)
            width: Original video width for resizing saliency map
            height: Original video height for resizing saliency map
            model: Model instance
            device: Device to use

        Returns:
            Tuple of (focal_points, preprocess_time, inference_time, postprocess_time)
        """
        preprocess_start = time.time()

        processed_clip = []
        for frame in clip:
            resized = cv2.resize(frame, (self.MODEL_WIDTH, self.MODEL_HEIGHT))
            rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
            normalized = rgb.astype(np.float32) / 255.0
            mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
            std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
            normalized = (normalized - mean) / std
            processed_clip.append(normalized)

        clip_np = np.stack(processed_clip, axis=0)
        clip_np = np.transpose(clip_np, (3, 0, 1, 2))
        clip_tensor = torch.from_numpy(clip_np).unsqueeze(0).to(device)

        preprocess_time = time.time() - preprocess_start

        inference_start_frame = time.time()
        saliency = model(clip_tensor)
        saliency_np = saliency.cpu().numpy()[0]
        inference_time = time.time() - inference_start_frame

        postprocess_start = time.time()

        saliency_resized = cv2.resize(saliency_np, (width, height))

        saliency_resized = cv2.GaussianBlur(
            saliency_resized,
            (self.GAUSSIAN_KERNEL_SIZE, self.GAUSSIAN_KERNEL_SIZE),
            self.GAUSSIAN_SIGMA,
        )

        sal_min = saliency_resized.min()
        sal_max = saliency_resized.max()
        if sal_max > sal_min:
            saliency_normalized = (saliency_resized - sal_min) / (sal_max - sal_min)
        else:
            saliency_normalized = saliency_resized

        focal_points = self._extract_focal_points(saliency_normalized)

        postprocess_time = time.time() - postprocess_start

        return focal_points, preprocess_time, inference_time, postprocess_time

    def _extract_focal_points(self, heatmap):
        """
        Extract focal points from a saliency heatmap.
        """
        if heatmap.max() > 1.0 or heatmap.min() < 0.0:
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)

        peaks = self._find_local_maxima(
            heatmap, self.PEAK_THRESHOLD, self.MIN_DISTANCE_PIXELS
        )

        peaks = peaks[: self.MAX_FOCAL_POINTS]

        focal_points = []
        for x, y, intensity in peaks:
            radius = self._calculate_radius(
                heatmap, x, y, intensity, self.RADIUS_INTENSITY_THRESHOLD
            )
            focal_point = FocalPoint(x, y, radius, intensity)
            focal_points.append(focal_point)

        return focal_points

    def _find_local_maxima(self, heatmap, threshold, min_distance):
        """Find local maxima in a 2D heatmap."""
        thresholded = heatmap > threshold

        neighborhood_size = max(3, min_distance)
        local_max = ndimage.maximum_filter(heatmap, size=neighborhood_size) == heatmap

        peaks = thresholded & local_max

        peak_coords = np.argwhere(peaks)

        if len(peak_coords) == 0:
            return []

        peak_intensities = heatmap[peaks]

        peaks_with_intensity = [
            (int(coord[1]), int(coord[0]), float(intensity))
            for coord, intensity in zip(peak_coords, peak_intensities)
        ]

        peaks_with_intensity.sort(key=lambda p: p[2], reverse=True)

        filtered_peaks = []
        for peak in peaks_with_intensity:
            x, y, intensity = peak

            too_close = False
            for accepted_x, accepted_y, _ in filtered_peaks:
                dist_sq = (x - accepted_x) ** 2 + (y - accepted_y) ** 2
                if dist_sq < min_distance**2:
                    too_close = True
                    break

            if not too_close:
                filtered_peaks.append(peak)

        return filtered_peaks

    def _calculate_radius(
        self, heatmap, center_x, center_y, peak_intensity, threshold_ratio
    ):
        """Calculate the radius of influence for a focal point."""
        height, width = heatmap.shape
        threshold_value = peak_intensity * threshold_ratio

        num_angles = 16
        angles = np.linspace(0, 2 * np.pi, num_angles, endpoint=False)

        radii = []
        max_search_radius = min(width, height) // 2

        for angle in angles:
            dx = np.cos(angle)
            dy = np.sin(angle)

            for r in range(1, max_search_radius):
                x = int(center_x + r * dx)
                y = int(center_y + r * dy)

                if x < 0 or x >= width or y < 0 or y >= height:
                    radii.append(r)
                    break

                if heatmap[y, x] < threshold_value:
                    radii.append(r)
                    break
            else:
                radii.append(max_search_radius)

        avg_radius = np.mean(radii)

        avg_radius = max(
            self.MIN_RADIUS_PIXELS, min(self.MAX_RADIUS_PIXELS, avg_radius)
        )

        return float(avg_radius)


class FocalPoint:
    """Represents a focal point in a frame"""

    def __init__(self, x, y, radius, intensity):
        self.x = float(x)
        self.y = float(y)
        self.radius = float(radius)
        self.intensity = float(intensity)

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "radius": round(self.radius, 2),
            "intensity": round(self.intensity, 4),
        }

    def __repr__(self):
        return f"FocalPoint(x={self.x:.1f}, y={self.y:.1f}, r={self.radius:.1f}, i={self.intensity:.3f})"
