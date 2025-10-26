import cv2
import numpy as np
import logging
import time
import sys
from reconstruction_renderer import ReconstructionRenderer
from config import FOVEATED_DEFAULTS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

def reconstruction_video_demo(
    input_path: str = "output_foveated.mp4",
    output_path: str = "output_reconstructed.mp4",
    stride: int = 4,
    thresh1: float = 0.1,
    thresh2: float = 0.25,
    thresh3: float = 0.4,
):
    logging.info(f"Opening input: {input_path}")
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        logging.error(f"Could not open video: {input_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    logging.info(f"Loaded video: {frame_count} frames @ {fps:.2f} FPS ({width}x{height})")

    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        logging.error(f"Could not open output writer for {output_path}")
        return

    params = FOVEATED_DEFAULTS.copy()
    params.update({"stride": stride, "thresh1": thresh1, "thresh2": thresh2, "thresh3": thresh3})

    renderer = ReconstructionRenderer(
        frag_path="shaders/reconstruction_shader.glsl",
        vert_path="shaders/vertex_shader.glsl",
        params=params,
    )

    start_time = time.time()
    frame_idx = 0
    logging.info("Processing frames...")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        center = (width / 2, height / 2)

        try:
            recon_frame = renderer.render(frame_rgb, center=center)
        except Exception as e:
            logging.exception(f"Error rendering frame {frame_idx}: {e}")
            break

        recon_bgr = cv2.cvtColor(recon_frame, cv2.COLOR_RGB2BGR)
        out.write(recon_bgr)
        frame_idx += 1

        if frame_idx % 10 == 0:
            elapsed = time.time() - start_time
            fps_current = frame_idx / elapsed if elapsed > 0 else 0
            logging.info(f"{frame_idx}/{frame_count} frames processed ({(frame_idx/frame_count)*100:.1f}%) | {fps_current:.2f} FPS")

    cap.release()
    out.release()
    total_time = time.time() - start_time
    logging.info(f"✅ Reconstruction complete: {output_path}")
    logging.info(f"Total time: {total_time:.2f}s | Avg FPS: {frame_idx / total_time:.2f}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_path", type=str, default="output_foveated.mp4")
    args = parser.parse_args()

    reconstruction_video_demo(input_path=args.input_path)