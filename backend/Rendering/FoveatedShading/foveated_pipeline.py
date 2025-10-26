"""
Foveated Video Processing Pipeline - Step 2
============================================

This script takes the JSON output from the video saliency model (step 1)
and applies foveated rendering to each frame using the detected focal points.
The processed video is then uploaded to S3.

Expected Input:
    - JSON file from step 1 containing focal points for each frame
    - Original video file

Output:
    - Foveated video uploaded to S3
    - S3 URL for the processed video
"""

import cv2
import numpy as np
import json
import logging
import time
import sys
import os
import boto3
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from foveated_renderer import FoveatedRenderer
from config import FOVEATED_DEFAULTS

# ----------------------------
# Configure logging
# ----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)


class FoveatedPipeline:
    """
    Pipeline for applying foveated rendering based on saliency detection.
    """

    def __init__(
        self,
        aws_access_key: Optional[str] = None,
        aws_secret_key: Optional[str] = None,
        aws_region: str = "us-east-1",
        s3_bucket: Optional[str] = None,
    ):
        """
        Initialize the pipeline with AWS credentials.

        Args:
            aws_access_key: AWS access key (or set AWS_ACCESS_KEY_ID env var)
            aws_secret_key: AWS secret key (or set AWS_SECRET_ACCESS_KEY env var)
            aws_region: AWS region (default: us-east-1)
            s3_bucket: S3 bucket name (or set S3_BUCKET env var)
        """
        # Get credentials from environment if not provided
        self.aws_access_key = aws_access_key or os.environ.get("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = aws_secret_key or os.environ.get("AWS_SECRET_ACCESS_KEY")
        self.aws_region = aws_region or os.environ.get("AWS_REGION", "us-east-1")
        self.s3_bucket = s3_bucket or os.environ.get("S3_BUCKET")

        # Initialize S3 client
        if self.aws_access_key and self.aws_secret_key:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.aws_access_key,
                aws_secret_access_key=self.aws_secret_key,
                region_name=self.aws_region,
            )
            logging.info("✅ S3 client initialized with provided credentials")
        else:
            # Try to use default credentials (IAM role, ~/.aws/credentials, etc.)
            try:
                self.s3_client = boto3.client("s3", region_name=self.aws_region)
                logging.info("✅ S3 client initialized with default credentials")
            except Exception as e:
                logging.warning(
                    f"⚠️  Could not initialize S3 client: {e}. "
                    "Video will be saved locally only."
                )
                self.s3_client = None

    def load_focal_points(self, json_path: str) -> Dict:
        """
        Load focal points JSON from step 1.

        Args:
            json_path: Path to the JSON file from saliency detection

        Returns:
            Dictionary containing video_info and focal_points
        """
        logging.info(f"Loading focal points from: {json_path}")
        with open(json_path, "r") as f:
            data = json.load(f)

        # Validate JSON structure
        if "video_info" not in data or "focal_points" not in data:
            raise ValueError(
                "Invalid JSON format. Expected 'video_info' and 'focal_points' keys."
            )

        num_frames = len(data["focal_points"])
        logging.info(
            f"✅ Loaded focal points for {num_frames} frames "
            f"({data['video_info']['width']}x{data['video_info']['height']} @ {data['video_info']['fps']:.2f} FPS)"
        )

        return data

    def extract_top_focal_points(
        self, frame_focal_data: Dict, max_points: int = 3
    ) -> List[Tuple[float, float]]:
        """
        Extract top N focal points from a frame, sorted by intensity.

        Args:
            frame_focal_data: Focal point data for a single frame
            max_points: Maximum number of focal points to extract (up to 3)

        Returns:
            List of (x, y) tuples for the top focal points
        """
        points = frame_focal_data.get("points", [])

        # Sort by intensity (descending)
        sorted_points = sorted(points, key=lambda p: p["intensity"], reverse=True)

        # Extract top N points
        top_points = sorted_points[:max_points]

        # Convert to (x, y) tuples
        centers = [(p["x"], p["y"]) for p in top_points]

        return centers

    def adjust_thresholds_for_multiple_foveae(
        self, base_params: Dict, num_foveae: int
    ) -> Dict:
        """
        Scale thresholds inversely with sqrt of number of foveae
        so that total high-detail area stays roughly constant.
        """
        scale = 1.0 / np.sqrt(max(1, num_foveae))
        params = base_params.copy()
        params["thresh1"] *= scale
        params["thresh2"] *= scale
        params["thresh3"] *= scale
        return params

    def process_video(
        self,
        input_video_path: str,
        focal_points_json_path: str,
        output_video_path: str,
        max_foveae: int = 3,
        stride: int = None,
        thresh1: float = None,
        thresh2: float = None,
        thresh3: float = None,
        upload_to_s3: bool = True,
        s3_key: Optional[str] = None,
    ) -> str:
        """
        Process video with foveated rendering based on detected focal points.

        Args:
            input_video_path: Path to the original video
            focal_points_json_path: Path to the JSON file from step 1
            output_video_path: Path to save the processed video
            max_foveae: Maximum number of focal points to use per frame (1-3)
            stride: Stride parameter for foveated rendering
            thresh1, thresh2, thresh3: Threshold parameters
            upload_to_s3: Whether to upload to S3
            s3_key: S3 key (filename) for upload. If None, uses basename of output_video_path

        Returns:
            S3 URL if uploaded, otherwise local file path
        """
        start_time = time.time()

        # Load focal points data
        focal_data = self.load_focal_points(focal_points_json_path)
        video_info = focal_data["video_info"]
        focal_points_by_frame = {
            fp["frame_index"]: fp for fp in focal_data["focal_points"]
        }

        # Open input video
        logging.info(f"Opening input video: {input_video_path}")
        cap = cv2.VideoCapture(input_video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {input_video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logging.info(
            f"📹 Video: {frame_count} frames at {fps:.2f} FPS ({width}x{height})"
        )

        # Verify video dimensions match focal points data
        if width != video_info["width"] or height != video_info["height"]:
            logging.warning(
                f"⚠️  Video dimensions ({width}x{height}) don't match "
                f"focal points data ({video_info['width']}x{video_info['height']})"
            )

        # Initialize video writer
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))
        if not out.isOpened():
            raise ValueError(
                f"Could not initialize VideoWriter for {output_video_path}"
            )

        # Set up rendering parameters
        max_foveae = min(max_foveae, 3)  # Cap at 3
        params = {
            "stride": stride if stride is not None else FOVEATED_DEFAULTS["stride"],
            "thresh1": thresh1 if thresh1 is not None else FOVEATED_DEFAULTS["thresh1"],
            "thresh2": thresh2 if thresh2 is not None else FOVEATED_DEFAULTS["thresh2"],
            "thresh3": thresh3 if thresh3 is not None else FOVEATED_DEFAULTS["thresh3"],
        }

        # Adjust thresholds for multiple foveae
        params = self.adjust_thresholds_for_multiple_foveae(params, max_foveae)

        logging.info(
            f"🎯 Rendering parameters: stride={params['stride']}, "
            f"thresh=[{params['thresh1']:.3f}, {params['thresh2']:.3f}, {params['thresh3']:.3f}], "
            f"max_foveae={max_foveae}"
        )

        # Initialize renderer with shader paths
        shader_dir = Path(__file__).parent / "shaders"
        renderer = FoveatedRenderer(
            frag_path=str(shader_dir / "foveated_render_multi.glsl"),
            vert_path=str(shader_dir / "vertex_shader.glsl"),
            params=params,
        )

        # Process frames
        logging.info("🚀 Starting frame-by-frame foveated rendering...")
        frame_idx = 0
        frames_with_focal_points = 0
        frames_without_focal_points = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Convert BGR to RGB for renderer
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Get focal points for this frame
            if frame_idx in focal_points_by_frame:
                centers = self.extract_top_focal_points(
                    focal_points_by_frame[frame_idx], max_points=max_foveae
                )
                frames_with_focal_points += 1
            else:
                # Default to center if no focal points available
                centers = [(width / 2, height / 2)]
                frames_without_focal_points += 1

            # Render foveated frame
            try:
                fov_frame = renderer.render(frame_rgb, centers=centers)
            except Exception as e:
                logging.exception(f"Error rendering frame {frame_idx}: {e}")
                break

            # Write frame (convert back to BGR)
            out.write(cv2.cvtColor(fov_frame, cv2.COLOR_RGB2BGR))
            frame_idx += 1

            # Progress logging
            if frame_idx % 30 == 0 or frame_idx == frame_count:
                elapsed = time.time() - start_time
                fps_current = frame_idx / elapsed if elapsed > 0 else 0
                logging.info(
                    f"⏱️  Processed {frame_idx}/{frame_count} frames "
                    f"({(frame_idx/frame_count)*100:.1f}%%) | Avg FPS: {fps_current:.2f}"
                )

        cap.release()
        out.release()

        processing_time = time.time() - start_time
        logging.info(
            f"✅ Foveated video saved to: {output_video_path} "
            f"({frames_with_focal_points} frames with focal points, "
            f"{frames_without_focal_points} with defaults)"
        )
        logging.info(
            f"⏱️  Total processing time: {processing_time:.2f}s | "
            f"Average FPS: {frame_idx / processing_time:.2f}"
        )

        # Upload to S3 if requested
        s3_url = None
        if upload_to_s3:
            s3_url = self.upload_to_s3(output_video_path, s3_key)

        return s3_url if s3_url else output_video_path

    def upload_to_s3(
        self, file_path: str, s3_key: Optional[str] = None
    ) -> Optional[str]:
        """
        Upload the processed video to S3.

        Args:
            file_path: Local path to the file to upload
            s3_key: S3 key (filename). If None, uses basename of file_path

        Returns:
            S3 URL if successful, None otherwise
        """
        if not self.s3_client:
            logging.warning(
                "⚠️  S3 client not initialized. Skipping upload. "
                "Video saved locally at: {file_path}"
            )
            return None

        if not self.s3_bucket:
            logging.error(
                "❌ S3 bucket not specified. Set S3_BUCKET environment variable "
                "or pass s3_bucket to constructor."
            )
            return None

        # Default S3 key to filename if not provided
        if s3_key is None:
            s3_key = f"foveated_videos/{Path(file_path).name}"

        try:
            logging.info(f"📤 Uploading to S3: s3://{self.s3_bucket}/{s3_key}")
            upload_start = time.time()

            # Upload with progress callback
            file_size = os.path.getsize(file_path)
            self.s3_client.upload_file(
                file_path,
                self.s3_bucket,
                s3_key,
                ExtraArgs={"ContentType": "video/mp4"},
            )

            upload_time = time.time() - upload_start
            logging.info(
                f"✅ Upload complete in {upload_time:.2f}s "
                f"({file_size / (1024 * 1024):.2f} MB)"
            )

            # Generate S3 URL
            s3_url = (
                f"https://{self.s3_bucket}.s3.{self.aws_region}.amazonaws.com/{s3_key}"
            )
            logging.info(f"🔗 S3 URL: {s3_url}")

            return s3_url

        except Exception as e:
            logging.exception(f"❌ Failed to upload to S3: {e}")
            return None


def main():
    """
    Main function for command-line usage.
    """
    import argparse

    parser = argparse.ArgumentParser(
        description="Apply foveated rendering to video based on saliency focal points"
    )
    parser.add_argument(
        "--input_video",
        type=str,
        required=True,
        help="Path to input video file",
    )
    parser.add_argument(
        "--focal_points_json",
        type=str,
        required=True,
        help="Path to JSON file from saliency detection (step 1)",
    )
    parser.add_argument(
        "--output_video",
        type=str,
        default=None,
        help="Path to save output video (default: input_foveated.mp4)",
    )
    parser.add_argument(
        "--max_foveae",
        type=int,
        default=3,
        help="Maximum number of focal points to use per frame (1-3)",
    )
    parser.add_argument(
        "--stride",
        type=int,
        default=None,
        help="Stride parameter for foveated rendering",
    )
    parser.add_argument(
        "--no_upload",
        action="store_true",
        help="Don't upload to S3, only save locally",
    )
    parser.add_argument(
        "--s3_bucket",
        type=str,
        default=None,
        help="S3 bucket name (overrides S3_BUCKET env var)",
    )
    parser.add_argument(
        "--s3_key",
        type=str,
        default=None,
        help="S3 key (path) for uploaded video",
    )

    args = parser.parse_args()

    # Default output path
    if args.output_video is None:
        input_path = Path(args.input_video)
        args.output_video = str(input_path.parent / f"{input_path.stem}_foveated.mp4")

    # Initialize pipeline
    pipeline = FoveatedPipeline(s3_bucket=args.s3_bucket)

    # Process video
    result_url = pipeline.process_video(
        input_video_path=args.input_video,
        focal_points_json_path=args.focal_points_json,
        output_video_path=args.output_video,
        max_foveae=args.max_foveae,
        stride=args.stride,
        upload_to_s3=not args.no_upload,
        s3_key=args.s3_key,
    )

    # Output result
    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)
    if result_url.startswith("http"):
        print(f"📹 Foveated video URL: {result_url}")
    else:
        print(f"📹 Foveated video saved locally: {result_url}")
    print("=" * 60)

    return result_url


if __name__ == "__main__":
    result_link = main()
    # This variable contains the S3 URL or local path for the next stage
    print(f"\n🔗 Link for next stage: {result_link}")
