# foveated_demo.py
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

def foveated_video_demo(
    input_path: str,
    output_path: str = "C:\Users\devya\Code\CalHacks\backend\Rendering\Videos\Outputs\output_foveated.mp4",
    fovea_trajectory: str = "center",  # "center", "scan", or "random"
    stride: int = FOVEATED_DEFAULTS["stride"],
    thresh1: float = FOVEATED_DEFAULTS["thresh1"],
    thresh2: float = FOVEATED_DEFAULTS["thresh2"],
    thresh3: float = FOVEATED_DEFAULTS["thresh3"],
):
    """
    Apply foveated rendering to every frame and save as H.264-compressed MP4.
    """
    logging.info("Attempting to open: %s", input_path)
    cap = cv2.VideoCapture(input_path)

    logging.info("Opened? %s", cap.isOpened())
    logging.info("Frame count reported by OpenCV: %s", cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sys.stdout.flush()

    if not cap.isOpened():
        logging.error("❌ Could not open video: %s", input_path)
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    logging.info(f"Video loaded: {frame_count} frames at {fps:.2f} FPS ({width}x{height})")

    # Initialize H.264 video writer
    fourcc = cv2.VideoWriter_fourcc(*"avc1")  # H.264 codec
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        logging.error("❌ Could not initialize VideoWriter for %s", output_path)
        return

    # Initialize renderer
    logging.info("Initializing foveated renderer (stride=%d)...", stride)
    params = FOVEATED_DEFAULTS.copy()
    params.update({"stride": stride, "thresh1": thresh1, "thresh2": thresh2, "thresh3": thresh3})
    renderer = FoveatedRenderer(
        frag_path="shaders/foveated_render.glsl",
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

        # Select fovea center per frame
        if fovea_trajectory == "center":
            center = (width / 2, height / 2)
        elif fovea_trajectory == "scan":
            center = ((frame_idx * 5) % width, height / 2)
        elif fovea_trajectory == "random":
            center = (np.random.randint(0, width), np.random.randint(0, height))
        else:
            center = (width / 2, height / 2)

        try:
            fov_frame = renderer.render(frame_rgb, center=center)
        except Exception as e:
            logging.exception("Error during rendering frame %d: %s", frame_idx, e)
            break

        # Convert back to BGR for writing
        fov_bgr = cv2.cvtColor(fov_frame, cv2.COLOR_RGB2BGR)
        out.write(fov_bgr)
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
    logging.info("✅ Saved foveated output to %s", output_path)
    logging.info("Total time: %.2fs | Average FPS: %.2f", total_time, frame_idx / total_time)

if __name__ == "__main__":
    logging.info("Starting demo script...")

    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_path", type=str, default="input.mp4")
    args = parser.parse_args()

    foveated_video_demo(input_path=args.input_path)