"""
Baseten/Truss Model Wrapper for Video Saliency Detection
==========================================================

This model processes videos to detect salient regions (areas that draw attention)
and extracts focal points with their positions, radii, and intensity scores.

Expected Input:
    {
        "video_url": "https://...",  # OR
        "video_base64": "...",        # base64 encoded video
        "output_format": "json",      # "json" (focal points only), "video" (not supported via API), or "both"
        "device": "auto"              # "auto", "cuda", "mps", or "cpu"
    }

Output:
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
        ]
    }
"""

import os
import tempfile
import base64
import requests
from pathlib import Path

import torch
import cv2
import numpy as np
from scipy import ndimage

# Import the video saliency model from packages directory
# Truss automatically adds packages/ to Python path
from model.Vinet_S_model import VideoSaliencyModel


class Model:
    def __init__(self, **kwargs):
        """
        Initialize the model wrapper.
        This runs when the model server starts.
        """
        self._data_dir = kwargs.get("data_dir")
        self._config = kwargs.get("config", {})
        self._secrets = kwargs.get("secrets", {})

        # Model will be loaded in load() method
        self._model = None
        self._device = None

        # Configuration for focal point extraction
        self.PEAK_THRESHOLD = 0.5
        self.MIN_DISTANCE_PIXELS = 50
        self.MAX_FOCAL_POINTS = 5
        self.RADIUS_INTENSITY_THRESHOLD = 0.5
        self.MIN_RADIUS_PIXELS = 30
        self.MAX_RADIUS_PIXELS = 300
        self.GAUSSIAN_KERNEL_SIZE = 11
        self.GAUSSIAN_SIGMA = 0

        # Video processing parameters
        self.CLIP_SIZE = 32  # ViNet-S uses 32 frames
        self.MODEL_HEIGHT = 224
        self.MODEL_WIDTH = 384

    def load(self):
        """
        Load the video saliency model and checkpoint.
        This runs exactly once when the model server is spun up.
        """
        print("Loading Video Saliency Model...")

        # Determine device
        if torch.cuda.is_available():
            self._device = torch.device("cuda")
            print("Using CUDA GPU")
        elif torch.backends.mps.is_available():
            self._device = torch.device("mps")
            print("Using Apple Silicon GPU (MPS)")
        else:
            self._device = torch.device("cpu")
            print("Using CPU")

        # Initialize model
        self._model = VideoSaliencyModel()

        # Load checkpoint
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

        print("Model loaded successfully!")

    def predict(self, model_input):
        """
        Run inference on input video and extract focal points.

        Args:
            model_input: Dictionary containing:
                - video_url: URL to download video from, OR
                - video_base64: Base64 encoded video data
                - output_format: "json" (default) - only focal points
                - device: Device override (optional)

        Returns:
            Dictionary with video info and focal points for each frame
        """
        # Parse input
        video_url = model_input.get("video_url")
        video_base64 = model_input.get("video_base64")
        output_format = model_input.get("output_format", "json")

        if not video_url and not video_base64:
            return {
                "error": "Must provide either 'video_url' or 'video_base64' in input"
            }

        # Create temporary file for video
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
            tmp_video_path = tmp_file.name

            try:
                # Download or decode video
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

                # Process video
                result = self._process_video(tmp_video_path)
                return result

            except Exception as e:
                return {"error": f"Error processing video: {str(e)}"}
            finally:
                # Clean up temporary file
                try:
                    os.unlink(tmp_video_path)
                except:
                    pass

    def _process_video(self, video_path):
        """
        Internal method to process video and extract focal points.
        """
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file")

        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        print(f"Video: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")

        # Read all frames
        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
        cap.release()

        print(f"Loaded {len(frames)} frames")

        # Prepare output data structure
        focal_points_data = {
            "video_info": {
                "width": width,
                "height": height,
                "fps": fps,
                "total_frames": total_frames,
            },
            "focal_points": [],
        }

        # Process frames
        with torch.no_grad():
            for i in range(len(frames)):
                # Get clip (32 frames ending at current frame)
                start_idx = max(0, i - self.CLIP_SIZE + 1)
                clip = frames[start_idx : i + 1]

                # Pad if needed
                if len(clip) < self.CLIP_SIZE:
                    clip = [frames[0]] * (self.CLIP_SIZE - len(clip)) + clip

                # Preprocess clip
                processed_clip = []
                for frame in clip:
                    # Resize to model input size
                    resized = cv2.resize(frame, (self.MODEL_WIDTH, self.MODEL_HEIGHT))
                    # BGR to RGB
                    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
                    # Normalize to [0, 1]
                    normalized = rgb.astype(np.float32) / 255.0
                    # Apply ImageNet normalization
                    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                    normalized = (normalized - mean) / std
                    processed_clip.append(normalized)

                # Convert to tensor: (C, T, H, W)
                clip_np = np.stack(processed_clip, axis=0)  # (T, H, W, C)
                clip_np = np.transpose(clip_np, (3, 0, 1, 2))  # (C, T, H, W)
                clip_tensor = (
                    torch.from_numpy(clip_np).unsqueeze(0).to(self._device)
                )  # (1, C, T, H, W)

                # Run inference
                saliency = self._model(clip_tensor)  # (1, H, W)
                saliency_np = saliency.cpu().numpy()[0]  # (H, W)

                # Resize saliency to original frame size
                saliency_resized = cv2.resize(saliency_np, (width, height))

                # Apply Gaussian blur
                saliency_resized = cv2.GaussianBlur(
                    saliency_resized,
                    (self.GAUSSIAN_KERNEL_SIZE, self.GAUSSIAN_KERNEL_SIZE),
                    self.GAUSSIAN_SIGMA,
                )

                # Normalize saliency to [0, 1] range
                sal_min = saliency_resized.min()
                sal_max = saliency_resized.max()
                if sal_max > sal_min:
                    saliency_normalized = (saliency_resized - sal_min) / (
                        sal_max - sal_min
                    )
                else:
                    saliency_normalized = saliency_resized

                # Extract focal points
                focal_points = self._extract_focal_points(saliency_normalized)

                focal_points_data["focal_points"].append(
                    {
                        "frame_index": i,
                        "points": [fp.to_dict() for fp in focal_points],
                    }
                )

                # Log progress
                if (i + 1) % 10 == 0 or i == len(frames) - 1:
                    print(f"Processed {i + 1}/{len(frames)} frames")

        return focal_points_data

    def _extract_focal_points(self, heatmap):
        """
        Extract focal points from a saliency heatmap.
        """
        # Ensure heatmap is normalized
        if heatmap.max() > 1.0 or heatmap.min() < 0.0:
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)

        # Find local maxima
        peaks = self._find_local_maxima(
            heatmap, self.PEAK_THRESHOLD, self.MIN_DISTANCE_PIXELS
        )

        # Limit to max_points
        peaks = peaks[: self.MAX_FOCAL_POINTS]

        # Calculate radii and create FocalPoint objects
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
        # Apply threshold
        thresholded = heatmap > threshold

        # Find local maxima using maximum filter
        neighborhood_size = max(3, min_distance)
        local_max = ndimage.maximum_filter(heatmap, size=neighborhood_size) == heatmap

        # Combine threshold and local maximum conditions
        peaks = thresholded & local_max

        # Get coordinates of peaks
        peak_coords = np.argwhere(peaks)

        if len(peak_coords) == 0:
            return []

        # Get intensities at peak locations
        peak_intensities = heatmap[peaks]

        # Combine coordinates and intensities
        peaks_with_intensity = [
            (int(coord[1]), int(coord[0]), float(intensity))
            for coord, intensity in zip(peak_coords, peak_intensities)
        ]

        # Sort by intensity (descending)
        peaks_with_intensity.sort(key=lambda p: p[2], reverse=True)

        # Apply min_distance constraint using greedy selection
        filtered_peaks = []
        for peak in peaks_with_intensity:
            x, y, intensity = peak

            # Check if this peak is far enough from all accepted peaks
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

        # Sample radial distances at multiple angles
        num_angles = 16
        angles = np.linspace(0, 2 * np.pi, num_angles, endpoint=False)

        radii = []
        max_search_radius = min(width, height) // 2

        for angle in angles:
            dx = np.cos(angle)
            dy = np.sin(angle)

            # Search along this ray for the threshold crossing
            for r in range(1, max_search_radius):
                x = int(center_x + r * dx)
                y = int(center_y + r * dy)

                # Check bounds
                if x < 0 or x >= width or y < 0 or y >= height:
                    radii.append(r)
                    break

                # Check if we've crossed the threshold
                if heatmap[y, x] < threshold_value:
                    radii.append(r)
                    break
            else:
                # Didn't find threshold crossing, use max search radius
                radii.append(max_search_radius)

        # Return average radius across all angles
        avg_radius = np.mean(radii)

        # Clamp to reasonable bounds
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
