"""
Example usage of the Foveated Pipeline
=======================================

This script demonstrates how to use the foveated pipeline
to process a video with detected focal points.
"""

from foveated_pipeline import FoveatedPipeline
import os


def example_basic_usage():
    """
    Basic example: Process video with focal points and upload to S3
    """
    print("=" * 60)
    print("Example 1: Basic Usage with S3 Upload")
    print("=" * 60)

    # Initialize pipeline with environment variables
    # Assumes AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET are set
    pipeline = FoveatedPipeline()

    # Process video
    s3_url = pipeline.process_video(
        input_video_path="path/to/your/video.mp4",
        focal_points_json_path="path/to/focal_points.json",
        output_video_path="output_foveated.mp4",
        max_foveae=3,  # Use up to 3 focal points per frame
        upload_to_s3=True,
    )

    print(f"\n✅ Processing complete!")
    print(f"🔗 Video URL: {s3_url}")

    # This URL can be passed to the next stage of your pipeline
    return s3_url


def example_local_only():
    """
    Example: Process video without S3 upload (local only)
    """
    print("\n" + "=" * 60)
    print("Example 2: Local Processing Only (No S3)")
    print("=" * 60)

    pipeline = FoveatedPipeline()

    local_path = pipeline.process_video(
        input_video_path="path/to/your/video.mp4",
        focal_points_json_path="path/to/focal_points.json",
        output_video_path="output_foveated.mp4",
        max_foveae=3,
        upload_to_s3=False,  # Don't upload to S3
    )

    print(f"\n✅ Processing complete!")
    print(f"📁 Local file: {local_path}")

    return local_path


def example_custom_parameters():
    """
    Example: Process with custom rendering parameters
    """
    print("\n" + "=" * 60)
    print("Example 3: Custom Rendering Parameters")
    print("=" * 60)

    pipeline = FoveatedPipeline(
        aws_region="us-west-2", s3_bucket="my-custom-bucket"  # Custom region
    )

    s3_url = pipeline.process_video(
        input_video_path="path/to/your/video.mp4",
        focal_points_json_path="path/to/focal_points.json",
        output_video_path="output_foveated_custom.mp4",
        max_foveae=2,  # Only use top 2 focal points
        stride=8,  # Faster processing, lower quality
        thresh1=0.15,  # Custom thresholds
        thresh2=0.30,
        thresh3=0.50,
        upload_to_s3=True,
        s3_key="custom/path/video.mp4",  # Custom S3 path
    )

    print(f"\n✅ Processing complete!")
    print(f"🔗 Video URL: {s3_url}")

    return s3_url


def example_single_fovea():
    """
    Example: Process with single focal point (fastest, most focused)
    """
    print("\n" + "=" * 60)
    print("Example 4: Single Focal Point")
    print("=" * 60)

    pipeline = FoveatedPipeline()

    s3_url = pipeline.process_video(
        input_video_path="path/to/your/video.mp4",
        focal_points_json_path="path/to/focal_points.json",
        output_video_path="output_single_fovea.mp4",
        max_foveae=1,  # Only use the highest-intensity focal point
        upload_to_s3=True,
    )

    print(f"\n✅ Processing complete!")
    print(f"🔗 Video URL: {s3_url}")

    return s3_url


def example_batch_processing():
    """
    Example: Process multiple videos in batch
    """
    print("\n" + "=" * 60)
    print("Example 5: Batch Processing")
    print("=" * 60)

    pipeline = FoveatedPipeline()

    # List of videos to process
    videos = [
        {
            "input": "video1.mp4",
            "focal_points": "focal_points1.json",
            "output": "output1_foveated.mp4",
        },
        {
            "input": "video2.mp4",
            "focal_points": "focal_points2.json",
            "output": "output2_foveated.mp4",
        },
    ]

    results = []
    for i, video in enumerate(videos, 1):
        print(f"\n📹 Processing video {i}/{len(videos)}...")

        s3_url = pipeline.process_video(
            input_video_path=video["input"],
            focal_points_json_path=video["focal_points"],
            output_video_path=video["output"],
            max_foveae=3,
            upload_to_s3=True,
        )

        results.append({"input": video["input"], "s3_url": s3_url})

    print(f"\n✅ Batch processing complete!")
    for result in results:
        print(f"  {result['input']} -> {result['s3_url']}")

    return results


def example_with_explicit_credentials():
    """
    Example: Initialize with explicit AWS credentials (not from environment)
    """
    print("\n" + "=" * 60)
    print("Example 6: Explicit Credentials")
    print("=" * 60)

    pipeline = FoveatedPipeline(
        aws_access_key="YOUR_ACCESS_KEY",
        aws_secret_key="YOUR_SECRET_KEY",
        aws_region="us-east-1",
        s3_bucket="your-bucket-name",
    )

    s3_url = pipeline.process_video(
        input_video_path="path/to/your/video.mp4",
        focal_points_json_path="path/to/focal_points.json",
        output_video_path="output_foveated.mp4",
        max_foveae=3,
        upload_to_s3=True,
    )

    print(f"\n✅ Processing complete!")
    print(f"🔗 Video URL: {s3_url}")

    return s3_url


if __name__ == "__main__":
    print("\n🎬 Foveated Pipeline Examples\n")

    # Uncomment the example you want to run:

    # example_basic_usage()
    # example_local_only()
    # example_custom_parameters()
    # example_single_fovea()
    # example_batch_processing()
    # example_with_explicit_credentials()

    print("\n" + "=" * 60)
    print("📝 Edit this file to uncomment and run examples")
    print("=" * 60)
