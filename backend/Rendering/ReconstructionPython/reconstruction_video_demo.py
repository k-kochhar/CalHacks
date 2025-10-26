import cv2
import numpy as np
import logging
import time
from reconstruction_renderer import ReconstructionRenderer
from config import FOVEATED_DEFAULTS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

def reconstruction_video_demo(
    foveated_path: str,
    output_path: str,
    fovea_mode: str = "multi",
    num_foveae: int = 3,
    stride: int = FOVEATED_DEFAULTS["stride"],
    thresh1: float = FOVEATED_DEFAULTS["thresh1"],
    thresh2: float = FOVEATED_DEFAULTS["thresh2"],
    thresh3: float = FOVEATED_DEFAULTS["thresh3"],
):
    cap = cv2.VideoCapture(foveated_path)
    if not cap.isOpened():
        logging.error(f"❌ Could not open video: {foveated_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    logging.info(f"Loaded {frame_count} frames @ {fps:.2f} FPS ({width}x{height})")

    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    renderer = ReconstructionRenderer(
        frag_path="shaders/reconstruction_shader.glsl",
        vert_path="shaders/vertex_shader.glsl",
        params={"stride": stride, "thresh1": thresh1, "thresh2": thresh2, "thresh3": thresh3},
    )

    frame_idx = 0
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # same fovea logic as before
        if fovea_mode == "center":
            centers = [(width / 2, height / 2)]
        elif fovea_mode == "scan":
            centers = [((frame_idx * 5) % width, height / 2)]
        elif fovea_mode == "multi":
            centers = [
                (width / 2, 5 * height / 6),
                (2 * width / 3, height / 2),
                (width / 2, height / 3),
            ][:num_foveae]
        elif fovea_mode == "random":
            centers = [
                (np.random.randint(0, width), np.random.randint(0, height))
                for _ in range(num_foveae)
            ]
        else:
            centers = [(width / 2, height / 2)]

        try:
            recon_rgb = renderer.render(frame_rgb, centers=centers, num_foveae=num_foveae)
        except Exception as e:
            logging.exception(f"Error rendering frame {frame_idx}: {e}")
            break

        out.write(cv2.cvtColor(recon_rgb, cv2.COLOR_RGB2BGR))
        frame_idx += 1

        if frame_idx % 10 == 0:
            elapsed = time.time() - start_time
            fps_current = frame_idx / elapsed if elapsed > 0 else 0
            logging.info(f"{frame_idx}/{frame_count} frames ({(frame_idx/frame_count)*100:.1f}%) | {fps_current:.2f} FPS")

    cap.release()
    out.release()
    total_time = time.time() - start_time
    logging.info(f"✅ Reconstruction saved → {output_path}")
    logging.info(f"Total time: {total_time:.2f}s | Avg FPS: {frame_idx / total_time:.2f}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--foveated_path", type=str, required=True)
    parser.add_argument("--output_path", type=str, default="output_reconstructed.mp4")
    parser.add_argument("--fovea_mode", type=str, default="multi")
    parser.add_argument("--num_foveae", type=int, default=3)
    args = parser.parse_args()

    reconstruction_video_demo(
        foveated_path=args.foveated_path,
        output_path=args.output_path,
        fovea_mode=args.fovea_mode,
        num_foveae=args.num_foveae,
    )