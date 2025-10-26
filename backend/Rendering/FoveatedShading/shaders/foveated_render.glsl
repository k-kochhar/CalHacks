#version 330 core

layout(location = 0) out vec4 fragColor;

uniform vec2 iResolution;    // (width, height)
uniform vec2 foveaCenter;    // pixel coords
uniform int stride;          // block size
uniform float thresh1;
uniform float thresh2;
uniform float thresh3;

uniform sampler2D tex;
in vec2 texCoord;

// how wide each quadrant cell is
int quad = stride / 2;

// ✅ MAGENTA marker for “missing/dropped”
const vec4 MISSING = vec4(1.0, 0.0, 1.0, 1.0);

vec4 expensive_main() { return texture(tex, texCoord); }

float norm2(vec2 a) { return dot(a, a); }
float sqr(float a)  { return a * a; }

void main() {
    vec2 coord = gl_FragCoord.xy - 0.5;

    // which sub-block am I in?
    float xmod = mod(coord.x, stride);
    float ymod = mod(coord.y, stride);

    // distance to (block-aligned) fovea center
    vec2 boxy_coord = floor(coord / stride) * stride;
    vec2 center     = floor(foveaCenter / stride) * stride;
    float d2 = norm2(boxy_coord - center);

    if (xmod < quad && ymod < quad) {              // top-left: always shaded
        fragColor = expensive_main();
    } else if (xmod < quad && ymod >= quad) {      // top-right
        fragColor = (d2 > sqr(thresh1)) ? MISSING : expensive_main();
    } else if (xmod >= quad && ymod < quad) {      // bottom-left
        fragColor = (d2 > sqr(thresh2)) ? MISSING : expensive_main();
    } else {                                       // bottom-right
        fragColor = (d2 > sqr(thresh3)) ? MISSING : expensive_main();
    }
}