#!/usr/bin/env python3
"""
FastAPI Orchestration Server for Video Processing Pipeline
===========================================================

Pipeline flow:
1. Receive video_id from frontend
2. Construct S3 URL from video_id
3. Call Baseten saliency model to get focal points
4. Download video from S3
5. Apply foveated rendering using focal points
6. Upload processed video to S3
7. Return dropped video URL
"""

import os
import sys
import tempfile
import logging
import time
from pathlib import Path
from typing import Optional

import numpy as np
import cv2
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Add Rendering directory to path for imports
sys.path.append(str(Path(__file__).parent / "Rendering" / "FoveatedShading"))
from foveated_renderer import FoveatedRenderer  # type: ignore
from config import FOVEATED_DEFAULTS  # type: ignore

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Video Processing Pipeline", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global clients
s3_client = None
foveated_renderer = None

# Environment variables
AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
BASETEN_API_URL = os.getenv("BASETEN_API_URL")
BASETEN_API_KEY = os.getenv("BASETEN_API_KEY")


class ProcessVideoRequest(BaseModel):
    video_id: str
    s3_url: str


class ProcessVideoResponse(BaseModel):
    video_id: str
    dropped_url: str
    focal_points_summary: dict
    performance_metrics: dict


@app.on_event("startup")
async def startup_event():
    """Initialize connections and renderer on startup"""
    global s3_client, foveated_renderer

    logger.info("Starting up FastAPI server...")

    # Validate environment variables
    required_env_vars = [
        "AWS_REGION",
        "AWS_S3_BUCKET",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "BASETEN_API_URL",
        "BASETEN_API_KEY",
    ]
    missing = [var for var in required_env_vars if not os.getenv(var)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {missing}")

    # Initialize S3 client
    logger.info("Initializing S3 client...")
    s3_client = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    logger.info("✅ S3 client initialized")

    # Initialize FoveatedRenderer
    logger.info("Initializing FoveatedRenderer...")
    shader_dir = Path(__file__).parent / "Rendering" / "FoveatedShading" / "shaders"
    frag_path = shader_dir / "foveated_render_multi.glsl"
    vert_path = shader_dir / "vertex_shader.glsl"

    if not frag_path.exists() or not vert_path.exists():
        raise RuntimeError(f"Shader files not found at {shader_dir}")

    foveated_renderer = FoveatedRenderer(
        frag_path=str(frag_path),
        vert_path=str(vert_path),
        params=FOVEATED_DEFAULTS.copy(),
    )

    # Check GPU availability
    if torch.cuda.is_available():
        logger.info("✅ CUDA GPU available for acceleration")
    elif torch.backends.mps.is_available():
        logger.info("✅ MPS (Apple Silicon) GPU available for acceleration")
    else:
        logger.info("⚠️  No GPU detected, using CPU")

    logger.info("✅ FoveatedRenderer initialized")
    logger.info("🚀 Server ready to process videos")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up connections on shutdown"""
    logger.info("Shutting down server...")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "video-processing-pipeline"}


@app.post("/api/process-video", response_model=ProcessVideoResponse)
async def process_video(request: ProcessVideoRequest):
    """
    Main pipeline endpoint: processes video through saliency detection
    and foveated rendering, returning the processed video URL.
    """
    video_id = request.video_id
    s3_url = request.s3_url
    logger.info(
        f"📥 Received processing request for video_id: {video_id}, s3_url: {s3_url}"
    )

    try:
        result = await process_pipeline(video_id, s3_url)
        logger.info(f"✅ Successfully processed video {video_id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Unexpected error processing video {video_id}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


async def process_pipeline(video_id: str, s3_url: str) -> ProcessVideoResponse:
    """
    Orchestrate the full video processing pipeline.
    """
    pipeline_start = time.time()
    temp_files = []

    try:
        # Step 1: Parse S3 URL to extract bucket and key
        logger.info(f"Step 1: Parsing S3 URL: {s3_url}")

        # Extract bucket and key from S3 URL
        # Expected format: https://bucket-name.s3.amazonaws.com/key/path
        # or https://s3.amazonaws.com/bucket-name/key/path
        if not s3_url.startswith("https://"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid S3 URL format: {s3_url}. Must start with https://",
            )

        url_parts = s3_url.replace("https://", "").split("/", 1)
        if len(url_parts) != 2:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid S3 URL format: {s3_url}. Cannot parse bucket and key",
            )

        host_part, s3_key = url_parts

        # Handle both URL formats
        if ".s3.amazonaws.com" in host_part:
            # Format: bucket-name.s3.amazonaws.com
            bucket_name = host_part.split(".s3.amazonaws.com")[0]
        elif host_part == "s3.amazonaws.com":
            # Format: s3.amazonaws.com/bucket-name/key -> key contains bucket
            key_parts = s3_key.split("/", 1)
            if len(key_parts) != 2:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid S3 URL format: {s3_url}. Cannot parse bucket from path-style URL",
                )
            bucket_name, s3_key = key_parts
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid S3 URL format: {s3_url}. Unrecognized S3 domain",
            )

        logger.info(f"  Parsed bucket: {bucket_name}, key: {s3_key}")

        # Verify video exists in S3
        try:
            s3_client.head_object(Bucket=bucket_name, Key=s3_key)
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                raise HTTPException(
                    status_code=404,
                    detail=f"Video not found at S3 URL: {s3_url}",
                )
            raise HTTPException(
                status_code=500, detail=f"Error accessing S3 URL {s3_url}: {str(e)}"
            )

        # Step 2: Call Baseten API for focal points
        logger.info(f"Step 2: Calling Baseten saliency model...")
        focal_points_data = get_focal_points(s3_url)
        logger.info(
            f"  Received focal points for {focal_points_data['video_info']['total_frames']} frames"
        )

        # Step 3: Download video from S3
        logger.info(f"Step 3: Downloading video from S3...")
        local_video_path = download_from_s3_url(s3_url, bucket_name, s3_key)
        temp_files.append(local_video_path)
        logger.info(f"  Downloaded to: {local_video_path}")

        # Step 4: Apply foveated rendering
        logger.info(f"Step 4: Applying foveated rendering...")
        output_video_path = apply_foveated_rendering(
            local_video_path, focal_points_data
        )
        temp_files.append(output_video_path)
        logger.info(f"  Foveated video created: {output_video_path}")

        # Step 5: Upload processed video to S3
        logger.info(f"Step 5: Uploading processed video to S3...")
        dropped_key = f"dropped/{video_id}.mp4"
        upload_to_s3(output_video_path, dropped_key)
        dropped_url = f"https://{AWS_S3_BUCKET}.s3.amazonaws.com/{dropped_key}"
        logger.info(f"  Uploaded to: {dropped_url}")

        # Calculate pipeline metrics
        total_time = time.time() - pipeline_start
        performance_metrics = {
            "total_pipeline_seconds": round(total_time, 2),
            "saliency_metrics": focal_points_data.get("performance_metrics", {}),
        }

        # Prepare summary
        focal_points_summary = {
            "total_frames": focal_points_data["video_info"]["total_frames"],
            "video_dimensions": f"{focal_points_data['video_info']['width']}x{focal_points_data['video_info']['height']}",
            "fps": focal_points_data["video_info"]["fps"],
        }

        logger.info(f"⏱️  Total pipeline time: {total_time:.2f}s")

        return ProcessVideoResponse(
            video_id=video_id,
            dropped_url=dropped_url,
            focal_points_summary=focal_points_summary,
            performance_metrics=performance_metrics,
        )

    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
                    logger.debug(f"Cleaned up temp file: {temp_file}")
            except Exception as e:
                logger.warning(f"Failed to clean up {temp_file}: {e}")


def get_focal_points(s3_url: str) -> dict:
    """
    Call Baseten saliency model API to get focal points for video.
    """
    try:
        response = requests.post(
            BASETEN_API_URL,
            headers={"Authorization": f"Api-Key {BASETEN_API_KEY}"},
            json={"video_url": s3_url},
            timeout=300,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Baseten API error: {e}")
        raise HTTPException(
            status_code=502, detail=f"Failed to get focal points from Baseten: {str(e)}"
        )


def download_from_s3_url(s3_url: str, bucket_name: str, s3_key: str) -> str:
    """
    Download file from S3 to a temporary local file using a pre-parsed S3 URL.
    Returns the local file path.
    """
    try:
        temp_fd, temp_path = tempfile.mkstemp(suffix=".mp4")
        os.close(temp_fd)

        s3_client.download_file(bucket_name, s3_key, temp_path)
        return temp_path
    except ClientError as e:
        logger.error(f"S3 download error: {e}")
        raise HTTPException(
            status_code=404, detail=f"Failed to download from S3: {str(e)}"
        )


def upload_to_s3(local_path: str, s3_key: str):
    """Upload local file to S3"""
    try:
        s3_client.upload_file(
            local_path,
            AWS_S3_BUCKET,
            s3_key,
            ExtraArgs={"ContentType": "video/mp4"},
        )
    except ClientError as e:
        logger.error(f"S3 upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload to S3: {str(e)}")


def adjust_thresholds_for_multiple_foveae(base_params: dict, num_foveae: int) -> dict:
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


def apply_foveated_rendering(video_path: str, focal_points_data: dict) -> str:
    """
    Apply foveated rendering to video using focal points as foveal centers.
    Returns path to output video file.
    """
    render_start = time.time()

    # Open input video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    logger.info(f"  Video: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")

    # Create temporary output file
    temp_fd, output_path = tempfile.mkstemp(suffix=".mp4")
    os.close(temp_fd)

    # Initialize video writer with H.264 codec
    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        raise RuntimeError("Could not initialize VideoWriter")

    # Extract focal points by frame
    focal_points_by_frame = {
        fp["frame_index"]: fp["points"] for fp in focal_points_data["focal_points"]
    }

    frame_idx = 0
    frames_processed = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Get focal points for this frame
            frame_focal_points = focal_points_by_frame.get(frame_idx, [])

            # Extract centers from focal points
            centers = [(pt["x"], pt["y"]) for pt in frame_focal_points]

            # If no focal points, use center of frame
            if not centers:
                centers = [(width / 2, height / 2)]

            # Adjust thresholds based on number of foveae
            num_foveae = len(centers)
            adjusted_params = adjust_thresholds_for_multiple_foveae(
                FOVEATED_DEFAULTS, num_foveae
            )
            foveated_renderer.update_params(**adjusted_params)

            # Render foveated frame
            fov_frame = foveated_renderer.render(frame_rgb, centers=centers)

            # Convert RGB back to BGR and write
            out.write(cv2.cvtColor(fov_frame, cv2.COLOR_RGB2BGR))

            frame_idx += 1
            frames_processed += 1

            # Log progress
            if frame_idx % 30 == 0 or frame_idx == total_frames:
                elapsed = time.time() - render_start
                fps_processing = frame_idx / elapsed if elapsed > 0 else 0
                logger.info(
                    f"    Rendered {frame_idx}/{total_frames} frames "
                    f"({(frame_idx/total_frames)*100:.1f}%%) | {fps_processing:.2f} FPS"
                )

    finally:
        cap.release()
        out.release()

    render_time = time.time() - render_start
    logger.info(
        f"  Rendering complete: {frames_processed} frames in {render_time:.2f}s "
        f"({frames_processed/render_time:.2f} FPS)"
    )

    return output_path


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
