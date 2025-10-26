#version 330 core

layout(location = 0) out vec4 fragColor;

uniform vec2 iResolution;
uniform float iTime;
uniform int iFrame;

in vec2 texCoord;
uniform sampler2D tex;

uniform int   stride;
uniform vec2  foveaCenter;
uniform float thresh1;
uniform float thresh2;
uniform float thresh3;

int   quad = stride / 2;

// ✅ robust magenta detector (survives compression)
//   r and b high, g low, with tolerance
bool isMissing(vec3 c) {
    return (c.r > 0.85 && c.b > 0.85 && c.g < 0.25);
}

float norm2(vec2 a) { return dot(a, a); }
float sqr(float a)  { return a * a; }

void main() {
    // integer pixel space for texelFetch
    vec2 coord = gl_FragCoord.xy - 0.5;

    // Which sub-block?
    float xmod = mod(coord.x, stride);
    float ymod = mod(coord.y, stride);

    // Fovea distance (block aligned)
    vec2 boxy_coord = floor(coord / stride) * stride;
    vec2 center     = floor(foveaCenter / stride) * stride;
    float d2 = norm2(boxy_coord - center);

    // Current pixel (from foveated, possibly magenta)
    vec4 here = texelFetch(tex, ivec2(coord), 0);

    // If this pixel is NOT missing, just return it unchanged.
    if (!isMissing(here.rgb)) {
        fragColor = here;
        return;
    }

    // Otherwise reconstruct depending on region/quadrant
    float weight_x = 0.5;
    float weight_y = 0.5;

    // Helper to read safely and know if it's valid
    vec4 c;
    vec4 acc = vec4(0.0);
    float cnt = 0.0;

    // Top-left quadrant (always shaded in source) – in magenta case fall back to neighbors
    if (xmod < quad && ymod < quad) {
        // Sample 4-neighborhood to fill this rare corner case
        c = texelFetch(tex, ivec2(coord.x, coord.y + 1), 0);   if (!isMissing(c.rgb)) { acc += c; cnt += 1.0; }
        c = texelFetch(tex, ivec2(coord.x, coord.y - 1), 0);   if (!isMissing(c.rgb)) { acc += c; cnt += 1.0; }
        c = texelFetch(tex, ivec2(coord.x + 1, coord.y), 0);   if (!isMissing(c.rgb)) { acc += c; cnt += 1.0; }
        c = texelFetch(tex, ivec2(coord.x - 1, coord.y), 0);   if (!isMissing(c.rgb)) { acc += c; cnt += 1.0; }
        fragColor = (cnt > 0.0) ? (acc / cnt) : vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Top-right quadrant
    if (xmod < quad && ymod >= quad) {
        if (d2 <= sqr(thresh1)) {
            fragColor = here; // inside smallest fovea: should be shaded; keep as is
            return;
        }

        weight_x = xmod / quad;                  // right+
        weight_y = (ymod - quad) / quad;        // up+
        vec4 top    = texelFetch(tex, ivec2(coord.x, coord.y + stride - ymod), 0);
        vec4 bottom = texelFetch(tex, ivec2(coord.x, coord.y - ymod + quad - 1), 0);
        vec4 left   = texelFetch(tex, ivec2(coord.x - xmod - 1, coord.y), 0);
        vec4 right  = texelFetch(tex, ivec2(coord.x + quad - xmod,  coord.y), 0);

        // Always accumulate vertical if valid
        acc = vec4(0.0); cnt = 0.0;
        if (!isMissing(top.rgb))    { acc += weight_y * top;    cnt += weight_y; }
        if (!isMissing(bottom.rgb)) { acc += (1.0 - weight_y) * bottom; cnt += (1.0 - weight_y); }

        // Accumulate horizontal if left is valid (mimics original logic)
        if (!isMissing(left.rgb)) {
            if (!isMissing(right.rgb)) { acc += weight_x * right; cnt += weight_x; }
            acc += (1.0 - weight_x) * left; cnt += (1.0 - weight_x);
        }

        if (cnt > 0.0) acc /= cnt; else acc = here;
        fragColor = acc;
        return;
    }

    // Bottom-left quadrant
    if (xmod >= quad && ymod < quad) {
        if (d2 <= sqr(thresh2)) {
            fragColor = here; // within middle region: keep original
            return;
        }

        weight_x = (xmod - quad) / quad; // right+
        weight_y = ymod / quad;          // up+

        vec4 left   = texelFetch(tex, ivec2(coord.x - xmod + quad - 1, coord.y), 0);
        vec4 right  = texelFetch(tex, ivec2(coord.x + stride - xmod,   coord.y), 0);
        vec4 bottom = texelFetch(tex, ivec2(coord.x, coord.y - ymod - 1), 0);
        vec4 top    = texelFetch(tex, ivec2(coord.x, coord.y + quad - ymod), 0);

        acc = vec4(0.0); cnt = 0.0;

        // Always accumulate L/R if valid
        if (!isMissing(left.rgb))  { acc += (1.0 - weight_x) * left;  cnt += (1.0 - weight_x); }
        if (!isMissing(right.rgb)) { acc += weight_x * right;         cnt += weight_x; }

        // Accumulate vertical if bottom is valid (mimic original)
        if (!isMissing(bottom.rgb)) {
            if (!isMissing(top.rgb)) { acc += weight_y * top; cnt += weight_y; }
            acc += (1.0 - weight_y) * bottom; cnt += (1.0 - weight_y);
        }

        if (cnt > 0.0) acc /= cnt; else acc = here;
        fragColor = acc;
        return;
    }

    // Bottom-right quadrant
    // Outside thresh3 we reconstruct; inside keep original
    if (d2 < sqr(thresh3)) {
        fragColor = here;
        return;
    }

    acc = vec4(0.0); cnt = 0.0;

    if (xmod < quad) {
        // vertical bilinear
        weight_y = (ymod - quad) / quad; // up+
        vec4 top    = texelFetch(tex, ivec2(coord.x, coord.y + stride - ymod), 0);
        vec4 bottom = texelFetch(tex, ivec2(coord.x, coord.y - ymod + quad - 1), 0);
        if (!isMissing(top.rgb))    { acc += weight_y * top;    cnt += weight_y; }
        if (!isMissing(bottom.rgb)) { acc += (1.0 - weight_y) * bottom; cnt += (1.0 - weight_y); }
    } else if (ymod < quad) {
        // horizontal bilinear
        weight_x = (xmod - quad) / quad; // right+
        vec4 R = texelFetch(tex, ivec2(coord.x + stride - xmod, coord.y), 0);
        vec4 L = texelFetch(tex, ivec2(coord.x - xmod + quad - 1, coord.y), 0);
        if (!isMissing(R.rgb)) { acc += weight_x * R; cnt += weight_x; }
        if (!isMissing(L.rgb)) { acc += (1.0 - weight_x) * L; cnt += (1.0 - weight_x); }
    } else {
        // diagonal "trilinear"
        weight_x = (xmod - quad) / quad; // right+
        weight_y = (ymod - quad) / quad; // up+
        float w1 = (1.0 - weight_y) * weight_x;         // bottom right
        float w2 = weight_y * (1.0 - weight_x);         // top left
        float w3 = weight_y * weight_x;                 // top right
        float w4 = (1.0 - weight_y) * (1.0 - weight_x); // bottom left

        vec4 BR = texelFetch(tex, ivec2(coord.x + stride - xmod,      coord.y - ymod + quad - 1), 0);
        vec4 TL = texelFetch(tex, ivec2(coord.x - xmod + quad - 1,    coord.y + stride - ymod), 0);
        vec4 TR = texelFetch(tex, ivec2(coord.x + stride - xmod,      coord.y + stride - ymod), 0);
        vec4 BL = texelFetch(tex, ivec2(coord.x - xmod + quad - 1,    coord.y - ymod + quad - 1), 0);

        if (!isMissing(BR.rgb)) { acc += w1 * BR; cnt += w1; }
        if (!isMissing(TL.rgb)) { acc += w2 * TL; cnt += w2; }
        if (!isMissing(TR.rgb)) { acc += w3 * TR; cnt += w3; }
        if (!isMissing(BL.rgb)) { acc += w4 * BL; cnt += w4; }
    }

    // Fallback if neighbors are also missing (edge cases)
    if (cnt > 0.0) fragColor = acc / cnt;
    else           fragColor = here; // leave as-is
}