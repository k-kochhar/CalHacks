import cv2
import numpy as np
import logging
import time
import sys
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

def adjust_thresholds_for_multiple_foveae(base_params, num_foveae):
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


def foveated_video_demo(
    input_path: str,
    output_path: str = "/Users/anuraagpandhi/Code/Calhacks/CalHacks/backend/Rendering/Videos/Outputs/output_foveated.mp4",
    fovea_mode: str = "center",  # "center", "scan", "multi", or "random"
    num_foveae: int = 1,
    stride: int = FOVEATED_DEFAULTS["stride"],
    thresh1: float = FOVEATED_DEFAULTS["thresh1"],
    thresh2: float = FOVEATED_DEFAULTS["thresh2"],
    thresh3: float = FOVEATED_DEFAULTS["thresh3"],
):
    """
    Apply foveated rendering (with up to 3 foveal centers) to every frame and save as MP4.
    """
    logging.info("Attempting to open: %s", input_path)
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        logging.error("❌ Could not open video: %s", input_path)
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    logging.info(f"Video loaded: {frame_count} frames at {fps:.2f} FPS ({width}x{height})")

    # Initialize H.264 video writer
    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        logging.error("❌ Could not initialize VideoWriter for %s", output_path)
        return

    # Adjust thresholds based on number of foveae
    params = adjust_thresholds_for_multiple_foveae(
        {
            "stride": stride,
            "thresh1": thresh1,
            "thresh2": thresh2,
            "thresh3": thresh3,
        },
        num_foveae,
    )

    renderer = FoveatedRenderer(
        frag_path="shaders/foveated_render_multi.glsl",  # updated multi-center shader
        vert_path="shaders/vertex_shader.glsl",
        params=params,
    )

    start_time = time.time()
    frame_idx = 0
    logging.info("Starting frame processing loop...")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        centers = []

        # Define centers depending on mode
        if fovea_mode == "center":
            centers = [(width / 2, 5 * height / 6)]
        elif fovea_mode == "scan":
            centers = [((frame_idx * 5) % width, height / 2)]
        elif fovea_mode == "multi":
            centers = [
                (width / 10, 5 * height / 6),
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
            # 🔍 Log the current foveal centers before sending to shader
            logging.info(
                f"Frame {frame_idx}: using {len(centers)} foveal center(s): "
                + ", ".join([f"({int(x)}, {int(y)})" for (x, y) in centers])
            )

            fov_frame = renderer.render(frame_rgb, centers=centers)

        except Exception as e:
            logging.exception("Error during rendering frame %d: %s", frame_idx, e)
            break

        out.write(cv2.cvtColor(fov_frame, cv2.COLOR_RGB2BGR))
        frame_idx += 1

        if frame_idx % 10 == 0:
            elapsed = time.time() - start_time
            fps_current = frame_idx / elapsed if elapsed > 0 else 0
            logging.info(
                f"Processed {frame_idx}/{frame_count} frames "
                f"({(frame_idx/frame_count)*100:.1f}%%) | Avg FPS: {fps_current:.2f}"
            )

    cap.release()
    out.release()
    total_time = time.time() - start_time
    logging.info("✅ Saved multi-fovea output to %s", output_path)
    logging.info("Total time: %.2fs | Average FPS: %.2f", total_time, frame_idx / total_time)


if __name__ == "__main__":
    logging.info("Starting demo script...")

    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_path", type=str, default="input.mp4")
    parser.add_argument("--num_foveae", type=int, default=3)
    parser.add_argument("--fovea_mode", type=str, default="multi")
    args = parser.parse_args()

    foveated_video_demo(input_path=args.input_path, num_foveae=args.num_foveae, fovea_mode=args.fovea_mode)