#!/usr/bin/env python3
"""Quick one-off test for Video Saliency Model"""

import requests
import os
import dotenv

dotenv.load_dotenv()

aws_video_url = "https://salient-labs-videos.s3.amazonaws.com/original/5427efeb-1d76-403e-8189-b6469531c879.mp4"

response = requests.post(
    os.environ.get("BASETEN_API_URL"),
    headers={"Authorization": f"Api-Key {os.environ.get('BASETEN_API_KEY')}"},
    json={"video_url": aws_video_url},
    timeout=300,
)

print("Status Code:", response.status_code)
print("\nResponse:")
print(response.json())
