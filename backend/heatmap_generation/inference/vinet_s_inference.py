"""
ViNet-S Inference
==================================

A script to run ViNet-S inference on a video.
This assumes you have the ViNet_v2 repository cloned and checkpoints downloaded.

Usage:
    python vinet_s_inference.py --video input.mp4 --checkpoint model.pt
"""

import sys
import os
import argparse
import json
from tqdm import tqdm

# Add parent directory to path to import the model
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from model.Vinet_S_model import VideoSaliencyModel
import focal_point_extractor as fpe
import config
import torch
import cv2
import numpy as np


class ViNetInference:
    def __init__(self, checkpoint_path, device="cuda"):
        self.device = torch.device(device if torch.cuda.is_available() else "cpu")
        self.model = VideoSaliencyModel()
        state_dict = torch.load(checkpoint_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()


def process_video(
    video_path, checkpoint_path, output_path, device="auto", output_format="video"
):
    """
    Process a video file with ViNet-S and output saliency maps or focal points

    Args:
        video_path: Path to input video
        checkpoint_path: Path to model checkpoint (.pt file)
        output_path: Path to save output (video or JSON file)
        device: 'auto', 'cuda', 'mps', or 'cpu'
               'auto' will automatically select the best available device
        output_format: 'video' (overlay visualization), 'json' (focal points), or 'both'
    """

    # Setup - Smart device selection
    if device == "auto":
        if torch.cuda.is_available():
            device = torch.device("cuda")
            device_name = "CUDA GPU"
        elif torch.backends.mps.is_available():
            device = torch.device("mps")
            device_name = "Apple Silicon GPU (MPS)"
        else:
            device = torch.device("cpu")
            device_name = "CPU"
    else:
        device = torch.device(device)
        device_name = str(device).upper()

    print(f"\n{'='*60}")
    print(f"🚀 Starting ViNet-S Inference")
    print(f"{'='*60}")
    print(f"📱 Device: {device_name} ({device})")

    # Load model
    print(f"\n[1/4] Loading model...")
    with tqdm(total=3, desc="Model Setup", unit="step", ncols=80) as pbar:
        model = VideoSaliencyModel()
        pbar.update(1)
        state_dict = torch.load(checkpoint_path, map_location=device, weights_only=True)
        pbar.update(1)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        pbar.update(1)
    print("✅ Model loaded successfully")

    # Open video
    print(f"\n[2/4] Opening video...")
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"📹 Video Info: {width}x{height} @ {fps:.1f}fps, {total_frames} frames")

    # Read all frames
    print(f"\n[3/4] Loading frames into memory...")
    frames = []
    with tqdm(
        total=total_frames, desc="Loading Frames", unit="frame", ncols=80
    ) as pbar:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
            pbar.update(1)
    cap.release()
    print(f"✅ Loaded {len(frames)} frames successfully")

    # Prepare output video writer (if needed)
    out = None
    if output_format in ["video", "both"]:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # Prepare focal points storage (if needed)
    focal_points_data = None
    if output_format in ["json", "both"]:
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
    print(f"\n[4/4] Processing frames with saliency detection...")
    CLIP_SIZE = 32  # ViNet-S uses 32 frames
    MODEL_HEIGHT = 224  # Model input height
    MODEL_WIDTH = 384  # Model input width

    print(
        f"⚙️  Clip size: {CLIP_SIZE} frames | Model input: {MODEL_WIDTH}x{MODEL_HEIGHT}"
    )

    output_frames = []

    with torch.no_grad():
        # Create progress bar for frame processing
        pbar = tqdm(
            range(len(frames)), desc="Processing Frames", unit="frame", ncols=80
        )
        for i in pbar:
            # Update progress bar with current stats
            if i > 0 and i % 10 == 0:
                pbar.set_postfix(
                    {
                        "fps": (
                            f'{10.0 / (pbar.format_dict["elapsed"] / i):.1f}'
                            if i > 0
                            else "N/A"
                        )
                    }
                )

            # Get clip (32 frames ending at current frame)
            start_idx = max(0, i - CLIP_SIZE + 1)
            clip = frames[start_idx : i + 1]

            # Pad if needed
            if len(clip) < CLIP_SIZE:
                clip = [frames[0]] * (CLIP_SIZE - len(clip)) + clip

            # Preprocess clip
            processed_clip = []
            for frame in clip:
                # Resize to model input size (224x384)
                resized = cv2.resize(frame, (MODEL_WIDTH, MODEL_HEIGHT))
                # BGR to RGB
                rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
                # Normalize to [0, 1]
                normalized = rgb.astype(np.float32) / 255.0
                # Apply ImageNet normalization (required by the model)
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                normalized = (normalized - mean) / std
                processed_clip.append(normalized)

            # Convert to tensor: (C, T, H, W)
            clip_np = np.stack(processed_clip, axis=0)  # (T, H, W, C)
            clip_np = np.transpose(clip_np, (3, 0, 1, 2))  # (C, T, H, W)
            clip_tensor = (
                torch.from_numpy(clip_np).unsqueeze(0).to(device)
            )  # (1, C, T, H, W)

            # Run inference
            saliency = model(clip_tensor)  # (1, H, W)
            saliency_np = saliency.cpu().numpy()[0]  # (H, W)

            # Debug: print saliency statistics for first frame
            if i == 0:
                pbar.write(f"📊 First frame saliency stats:")
                pbar.write(
                    f"   Range: [{saliency_np.min():.4f}, {saliency_np.max():.4f}]"
                )
                pbar.write(f"   Mean: {saliency_np.mean():.4f}")

            # Resize saliency to original frame size
            saliency_resized = cv2.resize(saliency_np, (width, height))

            # Apply Gaussian blur (as done in original code)
            saliency_resized = cv2.GaussianBlur(
                saliency_resized,
                (config.GAUSSIAN_KERNEL_SIZE, config.GAUSSIAN_KERNEL_SIZE),
                config.GAUSSIAN_SIGMA,
            )

            # Normalize saliency to [0, 1] range
            sal_min = saliency_resized.min()
            sal_max = saliency_resized.max()
            if sal_max > sal_min:
                saliency_normalized = (saliency_resized - sal_min) / (sal_max - sal_min)
            else:
                saliency_normalized = saliency_resized

            # Extract focal points if needed
            if output_format in ["json", "both"]:
                focal_points = fpe.extract_focal_points(saliency_normalized)
                focal_points_data["focal_points"].append(
                    {
                        "frame_index": i,
                        "points": fpe.focal_points_to_dict(focal_points),
                    }
                )

            # Generate video output if needed
            if output_format in ["video", "both"]:
                # Convert to heatmap
                saliency_uint8 = (saliency_normalized * 255).astype(np.uint8)
                heatmap = cv2.applyColorMap(saliency_uint8, cv2.COLORMAP_JET)

                # Blend with original frame
                overlay = cv2.addWeighted(frames[i], 0.5, heatmap, 0.5, 0)

                # Write to output
                out.write(overlay)

        # Close progress bar
        pbar.close()

    # Save outputs
    if out is not None:
        out.release()
        print(f"\n✅ Video processing complete!")
        print(f"💾 Video output saved to: {output_path}")

    if focal_points_data is not None:
        # Determine JSON output path
        if output_format == "json":
            json_path = output_path
        else:  # output_format == "both"
            json_path = os.path.splitext(output_path)[0] + "_focal_points.json"

        with open(json_path, "w") as f:
            json.dump(focal_points_data, f, indent=2)
        print(f"💾 Focal points saved to: {json_path}")

        # Print summary statistics
        total_points = sum(
            len(frame_data["points"])
            for frame_data in focal_points_data["focal_points"]
        )
        avg_points = (
            total_points / len(focal_points_data["focal_points"])
            if focal_points_data["focal_points"]
            else 0
        )
        print(
            f"📊 Summary: {total_points} total focal points, {avg_points:.1f} avg per frame"
        )

    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="Run ViNet-S inference on a video")
    parser.add_argument("--video", "-v", required=True, help="Input video path")
    parser.add_argument(
        "--checkpoint", "-c", required=True, help="Model checkpoint path"
    )
    parser.add_argument(
        "--output", "-o", default="output_saliency.mp4", help="Output file path"
    )
    parser.add_argument(
        "--device",
        "-d",
        default="auto",
        choices=["auto", "cuda", "mps", "cpu"],
        help="Device (auto will select best available: cuda > mps > cpu)",
    )
    parser.add_argument(
        "--output-format",
        "-f",
        default="video",
        choices=["video", "json", "both"],
        help="Output format: 'video' (saliency overlay), 'json' (focal points), or 'both'",
    )

    args = parser.parse_args()

    # Validate
    if not os.path.exists(args.video):
        print(f"❌ Error: Video not found: {args.video}")
        sys.exit(1)

    if not os.path.exists(args.checkpoint):
        print(f"❌ Error: Checkpoint not found: {args.checkpoint}")
        sys.exit(1)

    # Process
    process_video(
        args.video, args.checkpoint, args.output, args.device, args.output_format
    )
    print("🎉 All done! Processing complete.")


if __name__ == "__main__":
    main()
