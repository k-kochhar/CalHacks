#!/usr/bin/env python3
"""Quick test for Video Saliency Model with Foveated Rendering"""

import requests
import os
import base64

# Set your API key here or use environment variable
# API_KEY = os.environ.get("BASETEN_API_KEY", "YOUR_API_KEY_HERE")

aws_video_url = "https://salient-labs-videos.s3.amazonaws.com/original/5427efeb-1d76-403e-8189-b6469531c879.mp4"
short_video_url = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
long_video_url = (
    "https://videos.pexels.com/video-files/32990015/14059567_2048_1080_30fps.mp4"
)

# # Test 1: JSON output only (focal points)
# print("=" * 80)
# print("Test 1: JSON output (focal points only)")
# print("=" * 80)
# response = requests.post(
#     "https://model-03y4xg43.api.baseten.co/development/predict",
#     headers={"Authorization": f"Api-Key bSRhB0R4.5zVXIvEyniLB6Jzwrpxs0NETFvrXeRk8"},
#     json={"video_url": short_video_url, "output_format": "json"},
#     timeout=300,
# )

# print("Status Code:", response.status_code)
# result = response.json()
# print(f"Video Info: {result.get('video_info')}")
# print(f"Number of frames: {len(result.get('focal_points', []))}")
# print(f"Performance: {result.get('performance_metrics')}")

# Test 2: Foveated video output
print("\n" + "=" * 80)
print("Test 2: Foveated video output")
print("=" * 80)
response = requests.post(
    "https://model-03y4xg43.api.baseten.co/development/predict",
    headers={"Authorization": f"Api-Key bSRhB0R4.5zVXIvEyniLB6Jzwrpxs0NETFvrXeRk8"},
    json={"video_url": short_video_url, "output_format": "foveated_video"},
    timeout=600,
)

print("Status Code:", response.status_code)
result = response.json()
print(f"Video Info: {result.get('video_info')}")
print(f"Has foveated video: {'foveated_video_url' in result}")
if "foveated_video_url" in result:
    video_url = result["foveated_video_url"]
    print(f"Foveated video URL: {video_url}")

    # Optionally download the video
    download_video = input("\nDownload foveated video to file? (y/n): ").lower() == "y"
    if download_video:
        output_path = "output_foveated.mp4"
        video_response = requests.get(video_url)
        with open(output_path, "wb") as f:
            f.write(video_response.content)
        print(f"✅ Downloaded foveated video to {output_path}")

print(f"Performance: {result.get('performance_metrics')}")
