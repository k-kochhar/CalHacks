#!/usr/bin/env python3
"""Quick one-off test for Video Saliency Model"""

import requests
import os

# Set your API key here or use environment variable
# API_KEY = os.environ.get("BASETEN_API_KEY", "YOUR_API_KEY_HERE")

response = requests.post(
    "https://model-vq0n8y1w.api.baseten.co/development/predict",
    headers={"Authorization": f"Api-Key bSRhB0R4.5zVXIvEyniLB6Jzwrpxs0NETFvrXeRk8"},
    json={
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
    },
    timeout=300,
)

print("Status Code:", response.status_code)
print("\nResponse:")
print(response.json())
