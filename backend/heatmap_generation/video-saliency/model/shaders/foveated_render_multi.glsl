#version 330 core
layout(location = 0) out vec4 fragColor;

uniform vec2  iResolution;
uniform sampler2D tex;

uniform int   stride;
uniform float thresh1;
uniform float thresh2;
uniform float thresh3;

uniform int   numFoveae;
uniform vec2  foveaCenter0;
uniform vec2  foveaCenter1;
uniform vec2  foveaCenter2;

in vec2 texCoord;

const vec4 MISSING = vec4(1.0, 0.0, 1.0, 1.0);

float norm2(vec2 a) { return dot(a, a); }
float sqr(float a)  { return a * a; }

void main() {
    vec2 coord = gl_FragCoord.xy - 0.5;
    float xmod = mod(coord.x, stride);
    float ymod = mod(coord.y, stride);
    int quad   = stride / 2;
    vec2 boxy  = floor(coord / stride) * stride;

    // --- compute min distance² to any fovea center ---
    float d2_eff = 1e30;

    if (numFoveae > 0) d2_eff = min(d2_eff, norm2(boxy - floor(foveaCenter0 / stride) * stride));
    if (numFoveae > 1) d2_eff = min(d2_eff, norm2(boxy - floor(foveaCenter1 / stride) * stride));
    if (numFoveae > 2) d2_eff = min(d2_eff, norm2(boxy - floor(foveaCenter2 / stride) * stride));

    vec4 src = texture(tex, texCoord);

    if (xmod < quad && ymod < quad) {
        fragColor = src;
    }
    else if (xmod < quad && ymod >= quad) {
        fragColor = (d2_eff > sqr(thresh1)) ? MISSING : src;
    }
    else if (xmod >= quad && ymod < quad) {
        fragColor = (d2_eff > sqr(thresh2)) ? MISSING : src;
    }
    else {
        fragColor = (d2_eff > sqr(thresh3)) ? MISSING : src;
    }

    // ============================
    // 🔍 DEBUG VISUALIZATION MODE
    // ============================
    float r = 8.0;  // radius in pixels
    for (int i = 0; i < numFoveae; ++i) {
        vec2 c = (i == 0) ? foveaCenter0 :
                 (i == 1) ? foveaCenter1 : foveaCenter2;
        float dist = distance(coord, c);
        if (dist < r) {
            vec4 overlay = (i == 0) ? vec4(1.0, 0.0, 0.0, 0.7)
                           : (i == 1) ? vec4(0.0, 1.0, 0.0, 0.7)
                           : vec4(0.0, 0.0, 1.0, 0.7);
            fragColor = mix(fragColor, overlay, overlay.a);
        }
    }
}