#!/usr/bin/env python3
"""Quick one-off test for Video Saliency Model"""

import requests
import os

response = requests.post(
    os.environ.get("BASETEN_API_URL"),
    headers={"Authorization": f"Api-Key {os.environ.get('BASETEN_API_KEY')}"},
    json={
        "video_url": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
    },
    timeout=300,
)

print("Status Code:", response.status_code)
print("\nResponse:")
print(response.json())
