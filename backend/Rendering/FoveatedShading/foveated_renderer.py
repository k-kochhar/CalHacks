import moderngl
import numpy as np
from config import FOVEATED_DEFAULTS


class FoveatedRenderer:
    """
    ModernGL-based GPU renderer for multi-foveated shading.
    Supports up to 3 foveal centers.
    """

    def __init__(self, frag_path: str, vert_path: str, params: dict = None):
        self.ctx = moderngl.create_standalone_context()
        self.frag_path = frag_path
        self.vert_path = vert_path
        self.params = params or FOVEATED_DEFAULTS.copy()
        self._load_program()

    def _load_program(self):
        """Compile shaders once."""
        with open(self.vert_path, "r") as f:
            vert_src = f.read()
        with open(self.frag_path, "r") as f:
            frag_src = f.read()
        self.prog = self.ctx.program(vertex_shader=vert_src, fragment_shader=frag_src)

    def update_params(self, **kwargs):
        """Update stride / threshold parameters dynamically."""
        self.params.update(kwargs)

    def render(self, frame: np.ndarray, centers: list[tuple[float, float]] | None = None) -> np.ndarray:
        """
        Apply the foveated shading shader to one RGB frame.
        `centers`: list of up to 3 (x, y) pixel coordinates for foveal centers.
        """
        h, w = frame.shape[:2]
        centers = centers or [(w / 2, h / 2)]
        num = min(len(centers), 3)

        # --- Texture + framebuffer setup ---
        tex = self.ctx.texture((w, h), 3, frame.tobytes())
        tex.use(location=0)
        fbo = self.ctx.simple_framebuffer((w, h))
        fbo.use()

        # --- Bind core uniforms safely ---
        if "iResolution" in self.prog:
            self.prog["iResolution"].value = (w, h)
        if "tex" in self.prog:
            self.prog["tex"].value = 0
        if "stride" in self.prog:
            self.prog["stride"].value = int(self.params["stride"])

        # thresholds scaled by diagonal (consistent with fragment shader)
        diag = 0.5 * (w + h)
        for name in ["thresh1", "thresh2", "thresh3"]:
            if name in self.prog:
                self.prog[name].value = self.params[name] * diag

        # --- Multi-fovea uniform setup ---
        if "numFoveae" in self.prog:
            self.prog["numFoveae"].value = num

        # Assign all 3 centers explicitly (zero out unused)
# --- Multi-fovea uniforms (explicit names for macOS compatibility) ---
        uniform_names = ["foveaCenter0", "foveaCenter1", "foveaCenter2"]
        for i in range(3):
            cx, cy = centers[i] if i < num else (0.0, 0.0)
            if uniform_names[i] in self.prog:
                self.prog[uniform_names[i]].value = (float(cx), float(cy))
        # --- Fullscreen quad setup ---
        vertices = np.array([
            -1.0,  1.0, 0.0,  0.0, 1.0,
             1.0,  1.0, 0.0,  1.0, 1.0,
             1.0, -1.0, 0.0,  1.0, 0.0,
            -1.0, -1.0, 0.0,  0.0, 0.0,
        ], dtype="f4")

        indices = np.array([0, 1, 2, 2, 3, 0], dtype="i4")
        vbo = self.ctx.buffer(vertices)
        ibo = self.ctx.buffer(indices)
        vao_content = [(vbo, "3f 2f", "position", "inTexCoord")]
        vao = self.ctx.vertex_array(self.prog, vao_content, ibo)

        # --- Render pass ---
        vao.render()

        # --- Read result ---
        result = np.frombuffer(fbo.read(components=3), dtype=np.uint8).reshape((h, w, 3))

        # --- Cleanup ---
        vao.release()
        vbo.release()
        ibo.release()
        fbo.release()
        tex.release()

        return result