# C++ Interface Documentation

## Overview

This document describes the interface between the Python saliency detection module and the C++ shader pipeline for foveated rendering.

## Data Flow

```
Python (Saliency) → JSON File → C++ (Drop Shader) → Processed Frames → C++ (Fill Shader) → Client
```

## JSON Schema

The Python module outputs focal points in the following JSON format:

### Root Structure

```json
{
  "video_info": {
    "width": 1920,
    "height": 1080,
    "fps": 30.0,
    "total_frames": 150
  },
  "focal_points": [
    // Array of per-frame focal points
  ]
}
```

### Focal Points Array

Each element in the `focal_points` array represents one frame:

```json
{
  "frame_index": 0,
  "points": [
    {
      "x": 960.5, // X coordinate of focal point center (pixels)
      "y": 540.25, // Y coordinate of focal point center (pixels)
      "radius": 180.75, // Radius of high-saliency region (pixels)
      "intensity": 0.95 // Normalized saliency intensity [0.0, 1.0]
    }
    // Additional focal points (up to MAX_FOCAL_POINTS per frame)
  ]
}
```

### Field Descriptions

#### video_info

- `width`: Video frame width in pixels (integer)
- `height`: Video frame height in pixels (integer)
- `fps`: Frames per second (float)
- `total_frames`: Total number of frames (integer)

#### focal_points

- `frame_index`: Zero-based frame index (integer)
- `points`: Array of focal point objects (may be empty if no salient regions detected)

#### point object

- `x`: X coordinate of the focal point center in pixels (float, range: [0, width])
- `y`: Y coordinate of the focal point center in pixels (float, range: [0, height])
- `radius`: Effective radius of the salient region in pixels (float, range: [30, 300])
- `intensity`: Normalized peak saliency value (float, range: [0.0, 1.0])

## C++ Parsing Example

Here's an example using the popular `nlohmann/json` library:

```cpp
#include <fstream>
#include <vector>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct FocalPoint {
    float x;
    float y;
    float radius;
    float intensity;
};

struct FrameFocalPoints {
    int frame_index;
    std::vector<FocalPoint> points;
};

struct VideoFocalData {
    int width;
    int height;
    float fps;
    int total_frames;
    std::vector<FrameFocalPoints> focal_points;
};

VideoFocalData loadFocalPoints(const std::string& json_path) {
    // Read JSON file
    std::ifstream file(json_path);
    json j;
    file >> j;

    VideoFocalData data;

    // Parse video info
    data.width = j["video_info"]["width"];
    data.height = j["video_info"]["height"];
    data.fps = j["video_info"]["fps"];
    data.total_frames = j["video_info"]["total_frames"];

    // Parse focal points
    for (const auto& frame_data : j["focal_points"]) {
        FrameFocalPoints frame_focal;
        frame_focal.frame_index = frame_data["frame_index"];

        for (const auto& point : frame_data["points"]) {
            FocalPoint fp;
            fp.x = point["x"];
            fp.y = point["y"];
            fp.radius = point["radius"];
            fp.intensity = point["intensity"];
            frame_focal.points.push_back(fp);
        }

        data.focal_points.push_back(frame_focal);
    }

    return data;
}
```

## Shader Integration

### Mapping Focal Points to Foveated Rendering

The "drop" shader needs to determine which pixels to drop based on their distance from focal points. Here's a suggested approach:

#### 1. Distance Calculation

For each pixel `(px, py)`, calculate the minimum distance to any focal point:

```cpp
float minDistance = FLT_MAX;

for (const auto& fp : currentFrameFocalPoints) {
    float dx = px - fp.x;
    float dy = py - fp.y;
    float dist = sqrt(dx*dx + dy*dy);

    // Normalize by radius to get relative distance
    float normalized_dist = dist / fp.radius;

    minDistance = min(minDistance, normalized_dist);
}
```

#### 2. Drop Decision

Use the normalized distance and intensity to determine the drop pattern:

```cpp
// Example thresholds (similar to your shader example)
float thresh1 = 1.0;   // Within focal radius: keep all pixels
float thresh2 = 2.0;   // Medium distance: drop some pixels
float thresh3 = 3.0;   // Far distance: drop more pixels

bool shouldDrop = false;

if (minDistance < thresh1) {
    // High saliency region - keep pixel (no drop)
    shouldDrop = false;
} else if (minDistance < thresh2) {
    // Medium saliency - apply light dropping
    shouldDrop = (pixel_in_drop_pattern_1);
} else if (minDistance < thresh3) {
    // Low saliency - apply moderate dropping
    shouldDrop = (pixel_in_drop_pattern_2);
} else {
    // Very low saliency - apply heavy dropping
    shouldDrop = (pixel_in_drop_pattern_3);
}
```

#### 3. Intensity-Weighted Thresholds

You can also weight the thresholds by intensity for better quality:

```cpp
// Find the closest focal point
const FocalPoint* closest = nullptr;
float minDist = FLT_MAX;

for (const auto& fp : currentFrameFocalPoints) {
    float dist = distance(px, py, fp.x, fp.y);
    if (dist < minDist) {
        minDist = dist;
        closest = &fp;
    }
}

if (closest != nullptr) {
    // Scale thresholds by intensity (higher intensity = larger protected region)
    float scale = 0.5 + 0.5 * closest->intensity;
    float adjusted_thresh1 = thresh1 * scale;
    float adjusted_thresh2 = thresh2 * scale;
    float adjusted_thresh3 = thresh3 * scale;

    // Use adjusted thresholds for drop decision
}
```

## Shader Uniform Integration

In your shader code, you can pass focal points as uniforms:

```glsl
#version 330 core

// ... existing uniforms ...

uniform int numFocalPoints;
uniform vec2 focalCenters[5];  // Max 5 focal points
uniform float focalRadii[5];
uniform float focalIntensities[5];

void main() {
    vec2 coord = gl_FragCoord.xy;

    // Find minimum normalized distance to any focal point
    float minNormDist = 10000.0;

    for (int i = 0; i < numFocalPoints; i++) {
        vec2 center = focalCenters[i];
        float radius = focalRadii[i];

        float dist = distance(coord, center);
        float normDist = dist / radius;

        minNormDist = min(minNormDist, normDist);
    }

    // Use minNormDist to determine drop pattern (similar to your original shader)
    // ...
}
```

## Usage Example

### Python Side (Generating Focal Points)

```bash
# Generate focal points JSON
python vinet_s_inference.py \
    --video input.mp4 \
    --checkpoint model.pt \
    --output focal_points.json \
    --output-format json

# Or generate both video and JSON for debugging
python vinet_s_inference.py \
    --video input.mp4 \
    --checkpoint model.pt \
    --output output.mp4 \
    --output-format both
# Creates: output.mp4 and output_focal_points.json
```

### C++ Side (Loading and Using)

```cpp
// Load focal points
VideoFocalData focal_data = loadFocalPoints("focal_points.json");

// Process each frame
for (int frame_idx = 0; frame_idx < focal_data.total_frames; frame_idx++) {
    // Get focal points for this frame
    const auto& frame_focal = focal_data.focal_points[frame_idx];

    // Upload to shader as uniforms
    glUniform1i(numFocalPointsLoc, frame_focal.points.size());

    for (int i = 0; i < frame_focal.points.size(); i++) {
        const auto& fp = frame_focal.points[i];
        glUniform2f(focalCentersLoc + i, fp.x, fp.y);
        glUniform1f(focalRadiiLoc + i, fp.radius);
        glUniform1f(focalIntensitiesLoc + i, fp.intensity);
    }

    // Render frame with drop shader
    renderFrameWithDropShader();
}
```

## Configuration

The Python module uses configurable parameters defined in `config.py`:

- `PEAK_THRESHOLD`: Minimum saliency intensity to consider (default: 0.5)
- `MIN_DISTANCE_PIXELS`: Minimum separation between focal points (default: 50)
- `MAX_FOCAL_POINTS`: Maximum focal points per frame (default: 5)
- `RADIUS_INTENSITY_THRESHOLD`: Intensity falloff for radius calculation (default: 0.5)

These can be tuned to balance between:

- Quality (more focal points, larger radii = less compression)
- Performance (fewer focal points = faster shader execution)
- Compression ratio (smaller radii, more aggressive dropping = higher compression)

## Notes

1. **Empty Frames**: Some frames may have no salient regions detected. In this case, `points` will be an empty array `[]`. The shader should handle this gracefully (e.g., apply uniform moderate compression).

2. **Multiple Focal Points**: Frames typically have 1-5 focal points. The shader should consider all of them when making drop decisions.

3. **Coordinate System**: The coordinate system follows standard image conventions:

   - Origin (0, 0) is at the **top-left** corner
   - X increases to the right
   - Y increases downward

4. **Frame Indexing**: Frame indices are zero-based and sequential (0, 1, 2, ..., total_frames-1).

5. **Temporal Consistency**: For better visual quality, you may want to implement temporal smoothing of focal points across frames to avoid jittering (not currently implemented in the Python module).
