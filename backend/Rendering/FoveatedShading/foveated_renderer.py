import moderngl
import numpy as np
from config import FOVEATED_DEFAULTS

class FoveatedRenderer:
    def __init__(self, frag_path: str, vert_path: str, params: dict = None):
        self.ctx = moderngl.create_standalone_context()
        self.frag_path = frag_path
        self.vert_path = vert_path
        self.params = params or FOVEATED_DEFAULTS.copy()
        self._load_program()

    def _load_program(self):
        """Compile shaders once."""
        vert_src = open(self.vert_path).read()
        frag_src = open(self.frag_path).read()
        self.prog = self.ctx.program(vertex_shader=vert_src, fragment_shader=frag_src)

    def update_params(self, **kwargs):
        """Change stride / thresholds dynamically."""
        self.params.update(kwargs)

    def render(self, frame: np.ndarray, center: tuple[float, float] | None = None) -> np.ndarray:
        """
        Run foveated render shader on a single RGB frame.
        center: (x, y) pixel coordinates of foveal center (default = center of frame)
        """
        h, w = frame.shape[:2]
        tex = self.ctx.texture((w, h), 3, frame.tobytes())
        tex.use(location=0)

        fbo = self.ctx.simple_framebuffer((w, h))
        fbo.use()

        # Bind uniforms
        if "iResolution" in self.prog:
            self.prog["iResolution"].value = (w, h)
        if "tex" in self.prog:
            self.prog["tex"].value = 0

        # thresholds as fractions of diagonal length
        diag = 0.5 * (w + h)
        for name in ["thresh1", "thresh2", "thresh3"]:
            if name in self.prog:
                self.prog[name].value = self.params[name] * diag
        if "stride" in self.prog:
            self.prog["stride"].value = int(self.params["stride"])

        cx, cy = center if center is not None else (w / 2, h / 2)
        if "foveaCenter" in self.prog:
            self.prog["foveaCenter"].value = (float(cx), float(cy))

        # Build fullscreen quad (pos + texCoord)
        vertices = np.array([
            -1.0,  1.0, 0.0,  0.0, 1.0,
             1.0,  1.0, 0.0,  1.0, 1.0,
             1.0, -1.0, 0.0,  1.0, 0.0,
            -1.0, -1.0, 0.0,  0.0, 0.0
        ], dtype='f4')
        indices = np.array([0, 1, 2, 2, 3, 0], dtype='i4')
        vbo = self.ctx.buffer(vertices)
        ibo = self.ctx.buffer(indices)
        vao_content = [(vbo, '3f 2f', 'position', 'inTexCoord')]
        vao = self.ctx.vertex_array(self.prog, vao_content, ibo)

        vao.render()

        result = np.frombuffer(fbo.read(components=3), dtype=np.uint8).reshape((h, w, 3))

        vao.release()
        vbo.release()
        ibo.release()
        fbo.release()
        tex.release()

        return result