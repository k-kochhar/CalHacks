# Video Saliency Model - Baseten/Truss Deployment

This directory contains a Baseten/Truss-ready deployment of the ViNet-S video saliency detection model.

## Overview

This model processes videos to detect salient regions (areas that naturally draw human attention) and extracts focal points with their positions, radii, and intensity scores. It's useful for:

- Video summarization
- Attention-based video editing
- UI/UX analysis for video content
- Accessibility features

## Model Architecture

- **Base Model**: ViNet-S (Video Saliency Model - Small)
- **Input**: Videos (via URL or base64 encoding)
- **Output**: Frame-by-frame focal point coordinates with intensity scores

## Directory Structure

```
video-saliency/
├── model/
│   ├── __init__.py
│   └── model.py           # Main Truss Model wrapper
├── packages/
│   └── model/
│       ├── __init__.py
│       ├── Vinet_S_model.py      # Model architecture
│       └── model_utils.py        # Utility functions
├── data/
│   └── checkpoints/
│       └── vinet_s_mvva_randomsplit.pt  # Pre-trained weights
├── config.yaml            # Truss configuration
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Prerequisites

- Baseten account (for deployment)
- Truss CLI installed: `pip install truss`

## Deployment

### 1. Install Truss CLI

```bash
pip install truss
```

### 2. Login to Baseten

```bash
truss login
```

### 3. Deploy the Model

From this directory:

```bash
truss push
```

The deployment process will:

1. Package the model code and dependencies
2. Upload the checkpoint file (~38MB)
3. Build a Docker container
4. Deploy to Baseten's infrastructure

## Usage

### API Request Format

Once deployed, you can call the model via REST API:

#### Option 1: Video URL

```json
{
  "video_url": "https://example.com/video.mp4"
}
```

#### Option 2: Base64 Encoded Video

```json
{
  "video_base64": "<base64_encoded_video_data>"
}
```

### Example with Python

```python
import requests
import base64

# Using Baseten SDK
from baseten import deployed_model

# Get your model ID from Baseten dashboard
model = deployed_model.load("YOUR_MODEL_ID")

# Option 1: Using video URL
response = model.predict({
    "video_url": "https://example.com/sample_video.mp4"
})

# Option 2: Using local video file
with open("video.mp4", "rb") as video_file:
    video_data = base64.b64encode(video_file.read()).decode('utf-8')

response = model.predict({
    "video_base64": video_data
})

print(response)
```

### Example with cURL

```bash
curl -X POST https://model-<your-model-id>.api.baseten.co/predict \
  -H "Authorization: Bearer $BASETEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://example.com/video.mp4"
  }'
```

## Response Format

The model returns a JSON object with video information and focal points for each frame:

```json
{
  "video_info": {
    "width": 1920,
    "height": 1080,
    "fps": 30.0,
    "total_frames": 300
  },
  "focal_points": [
    {
      "frame_index": 0,
      "points": [
        {
          "x": 960.5,
          "y": 540.25,
          "radius": 150.8,
          "intensity": 0.9234
        },
        {
          "x": 1200.0,
          "y": 300.0,
          "radius": 85.5,
          "intensity": 0.7856
        }
      ]
    },
    {
      "frame_index": 1,
      "points": [...]
    }
    // ... more frames
  ]
}
```

### Response Fields

- `video_info`: Metadata about the processed video

  - `width`, `height`: Video dimensions in pixels
  - `fps`: Frames per second
  - `total_frames`: Total number of frames processed

- `focal_points`: Array of focal points per frame
  - `frame_index`: Frame number (0-indexed)
  - `points`: Array of detected focal points in this frame
    - `x`, `y`: Coordinates of the focal point center (in pixels)
    - `radius`: Radius of influence (in pixels)
    - `intensity`: Saliency intensity score (0-1, higher = more salient)

## Configuration

The model behavior can be customized by modifying parameters in `model/model.py`:

```python
# Focal point extraction parameters
PEAK_THRESHOLD = 0.5              # Min intensity to consider (0-1)
MIN_DISTANCE_PIXELS = 50          # Min distance between focal points
MAX_FOCAL_POINTS = 5              # Max focal points per frame
RADIUS_INTENSITY_THRESHOLD = 0.5  # Threshold for radius calculation
MIN_RADIUS_PIXELS = 30            # Min focal point radius
MAX_RADIUS_PIXELS = 300           # Max focal point radius
GAUSSIAN_KERNEL_SIZE = 11         # Blur kernel size (must be odd)
GAUSSIAN_SIGMA = 0                # Blur sigma (0 = auto)
```

## Hardware Requirements

As specified in `config.yaml`:

- **GPU**: NVIDIA A100 (recommended for production)
- **CPU**: 8 cores
- **Memory**: 32GB RAM
- **Model Size**: ~38MB checkpoint + runtime overhead

For testing/development, you can modify `config.yaml` to use smaller GPUs:

```yaml
resources:
  accelerator: T4 # or A10G for cost-effective option
  cpu: "4"
  memory: 16Gi
  use_gpu: true
```

## Performance

- **Processing Speed**: ~10-30 frames/second (depending on GPU)
- **Model Input Resolution**: 384x224 (upscaled/downscaled automatically)
- **Clip Size**: 32 frames (temporal context window)
- **Cold Start**: ~30-60 seconds (model loading)
- **Warm Inference**: <100ms per frame on A100

## Limitations

1. **Video Length**: Long videos may take significant time to process. Consider chunking videos longer than 5 minutes.
2. **Memory**: All frames are loaded into memory. Very high-resolution or long videos may exceed memory limits.
3. **Format Support**: Depends on OpenCV's video codec support (MP4, AVI, MOV typically work well).
4. **Network Transfer**: Base64 encoding increases payload size by ~33%. Use URLs for large videos when possible.

## Troubleshooting

### Model Loading Errors

If you see "Model checkpoint not found":

- Ensure `data/checkpoints/vinet_s_mvva_randomsplit.pt` exists
- Verify the checkpoint was uploaded during deployment

### Import Errors

If you see module import errors:

- Check that `packages/model/` contains all required files
- Verify `__init__.py` exists in the model package

### Video Processing Errors

Common issues:

- **"Could not open video file"**: Check video format/codec
- **Out of memory**: Reduce video resolution or length
- **Timeout**: Video is too long; consider chunking

### Performance Issues

- Use A100 GPU for production (configured in `config.yaml`)
- Enable batching for multiple videos (requires model modification)
- Consider caching results for frequently accessed videos

## Development

### Local Testing

You can test the model locally using Truss:

```bash
# From this directory
truss run-server

# In another terminal
truss predict --help
```

### Modifying the Model

1. Edit `model/model.py` for inference logic changes
2. Update `requirements.txt` if adding dependencies
3. Modify `config.yaml` for resource adjustments
4. Test locally before deploying

## References

- [Baseten Documentation](https://docs.baseten.co/)
- [Truss Documentation](https://truss.baseten.co/)
- ViNet-S Paper: Video Saliency Detection with Vision Transformers

## Support

For issues specific to:

- **Model deployment**: Contact Baseten support
- **Model architecture**: Refer to the ViNet-S paper
- **This implementation**: Check the CalHacks project repository

## License

See the main project repository for license information.
