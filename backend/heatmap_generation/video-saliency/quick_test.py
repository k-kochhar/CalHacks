#!/usr/bin/env python3
"""Quick test for Video Saliency Model with Foveated Rendering"""

import requests
import os
import base64

aws_video_url = "https://salient-labs-videos.s3.amazonaws.com/original/5427efeb-1d76-403e-8189-b6469531c879.mp4"
short_video_url = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
long_video_url = (
    "https://videos.pexels.com/video-files/32990015/14059567_2048_1080_30fps.mp4"
)

response = requests.post(
    os.environ.get("BASETEN_API_URL"),
    headers={"Authorization": f"Api-Key {os.environ.get('BASETEN_API_KEY')}"},
    json={"video_url": aws_video_url},
    timeout=300,
)
