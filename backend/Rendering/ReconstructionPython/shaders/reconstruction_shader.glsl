#version 330 core
layout(location = 0) out vec4 fragColor;

uniform vec2 iResolution;
uniform sampler2D texFov;

uniform int   stride;
uniform float thresh1;
uniform float thresh2;
uniform float thresh3;

uniform int  numFoveae;
uniform vec2 foveaCenter0;
uniform vec2 foveaCenter1;
uniform vec2 foveaCenter2;

int quad = stride / 2;

// Robust magenta detector (survives compression)
bool isMissing(vec3 c) {
    float rb = 0.5 * (c.r + c.b);
    return (rb > 0.55 && c.g < 0.45 && (c.r + c.b) - 1.1 * c.g > 0.30);
}

float norm2(vec2 a) { return dot(a, a); }
float sqr(float a)  { return a * a; }

float minDistance2(vec2 p) {
    float d2 = 1e30;
    if (numFoveae > 0) d2 = min(d2, norm2(p - foveaCenter0));
    if (numFoveae > 1) d2 = min(d2, norm2(p - foveaCenter1));
    if (numFoveae > 2) d2 = min(d2, norm2(p - foveaCenter2));
    return d2;
}

void main() {
    vec2 coord = gl_FragCoord.xy - 0.5;
    ivec2 px = ivec2(coord);

    vec4 fov = texelFetch(texFov, px, 0);

    // keep valid pixels
    if (!isMissing(fov.rgb)) {
        fragColor = fov;
        return;
    }

    // distance to nearest fovea determines radius
    float d2 = minDistance2(coord);
    float reconRadius = (d2 < sqr(thresh1)) ? 1.0 :
                        (d2 < sqr(thresh2)) ? 2.0 :
                        (d2 < sqr(thresh3)) ? 3.0 : 4.0;

    vec4 acc = vec4(0.0);
    float cnt = 0.0;
    int rMax = int(reconRadius);

    for (int r = 1; r <= rMax; ++r) {
        float w = 1.0 / (float(r) + 0.001);
        for (int dx = -r; dx <= r; ++dx) {
            for (int dy = -r; dy <= r; ++dy) {
                ivec2 pos = px + ivec2(dx, dy);
                vec4 n = texelFetch(texFov, pos, 0);
                if (!isMissing(n.rgb)) {
                    acc += w * n;
                    cnt += w;
                }
            }
        }
        if (cnt > 0.0) break;
    }

    if (cnt == 0.0)
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    else
        fragColor = acc / cnt;
}