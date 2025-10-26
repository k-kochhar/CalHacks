import moderngl
import numpy as np
from config import FOVEATED_DEFAULTS


class ReconstructionRenderer:
    """
    Client-side GPU renderer that reconstructs missing regions
    from foveated frames using spatial interpolation.
    """

    def __init__(self, frag_path: str, vert_path: str, params: dict = None):
        self.ctx = moderngl.create_standalone_context()
        self.frag_path = frag_path
        self.vert_path = vert_path
        self.params = params or FOVEATED_DEFAULTS.copy()
        self._load_program()

    def _load_program(self):
        with open(self.vert_path, "r") as f:
            vert_src = f.read()
        with open(self.frag_path, "r") as f:
            frag_src = f.read()
        self.prog = self.ctx.program(vertex_shader=vert_src, fragment_shader=frag_src)

    def render(self, foveated_frame: np.ndarray,
               centers: list[tuple[float, float]] | None = None,
               num_foveae: int = 1) -> np.ndarray:
        h, w = foveated_frame.shape[:2]
        tex_fov = self.ctx.texture((w, h), 3, foveated_frame.tobytes())
        tex_fov.use(location=0)
        fbo = self.ctx.simple_framebuffer((w, h))
        fbo.use()

        # Bind uniforms
        # self.prog["iResolution"].value = (w, h)
        self.prog["texFov"].value = 0
        self.prog["stride"].value = int(self.params["stride"])
        diag = 0.5 * (w + h)
        for name in ["thresh1", "thresh2", "thresh3"]:
            self.prog[name].value = self.params[name] * diag

        centers = centers or [(w / 2, h / 2)]
        num_foveae = min(num_foveae, 3)
        self.prog["numFoveae"].value = num_foveae

        for i in range(3):
            cx, cy = centers[i] if i < num_foveae else (0.0, 0.0)
            name = f"foveaCenter{i}"
            if name in self.prog:
                self.prog[name].value = (float(cx), float(cy))

        vertices = np.array([
            -1.0,  1.0, 0.0,  0.0, 1.0,
             1.0,  1.0, 0.0,  1.0, 1.0,
             1.0, -1.0, 0.0,  1.0, 0.0,
            -1.0, -1.0, 0.0,  0.0, 0.0,
        ], dtype="f4")
        indices = np.array([0, 1, 2, 2, 3, 0], dtype="i4")
        vbo = self.ctx.buffer(vertices)
        ibo = self.ctx.buffer(indices)
        vao = self.ctx.vertex_array(self.prog, [(vbo, "3f 2f", "position", "inTexCoord")], ibo)
        vao.render()

        result = np.frombuffer(fbo.read(components=3), dtype=np.uint8).reshape((h, w, 3))
        vao.release(); vbo.release(); ibo.release(); fbo.release(); tex_fov.release()
        return result