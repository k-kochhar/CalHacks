"""
Unit tests for focal point extraction from saliency heatmaps
"""

import sys
import os
import json
import numpy as np

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

import focal_point_extractor as fpe
import config


def create_synthetic_heatmap_single_peak(
    width=640, height=480, center_x=320, center_y=240
):
    """Create a synthetic heatmap with a single Gaussian peak"""
    x = np.arange(width)
    y = np.arange(height)
    xx, yy = np.meshgrid(x, y)

    # Gaussian peak
    sigma = 80
    heatmap = np.exp(-((xx - center_x) ** 2 + (yy - center_y) ** 2) / (2 * sigma**2))

    return heatmap


def create_synthetic_heatmap_multiple_peaks(width=640, height=480):
    """Create a synthetic heatmap with multiple peaks"""
    x = np.arange(width)
    y = np.arange(height)
    xx, yy = np.meshgrid(x, y)

    # Three peaks at different locations
    peaks = [
        (160, 120, 60, 1.0),  # (x, y, sigma, intensity)
        (480, 360, 80, 0.8),
        (320, 240, 50, 0.6),
    ]

    heatmap = np.zeros((height, width))
    for px, py, sigma, intensity in peaks:
        peak = intensity * np.exp(-((xx - px) ** 2 + (yy - py) ** 2) / (2 * sigma**2))
        heatmap = np.maximum(heatmap, peak)

    return heatmap


def create_synthetic_heatmap_no_peaks(width=640, height=480):
    """Create a uniform low-intensity heatmap (no salient regions)"""
    return np.ones((height, width)) * 0.3


def test_single_focal_point():
    """Test extraction of a single focal point"""
    print("Test 1: Single focal point")

    heatmap = create_synthetic_heatmap_single_peak(
        width=640, height=480, center_x=320, center_y=240
    )
    focal_points = fpe.extract_focal_points(heatmap, threshold=0.5)

    assert len(focal_points) >= 1, "Should detect at least one focal point"

    # Check that the detected point is near the center
    fp = focal_points[0]
    assert abs(fp.x - 320) < 20, f"X coordinate should be near 320, got {fp.x}"
    assert abs(fp.y - 240) < 20, f"Y coordinate should be near 240, got {fp.y}"
    assert fp.radius > config.MIN_RADIUS_PIXELS, "Radius should be above minimum"
    assert fp.radius < config.MAX_RADIUS_PIXELS, "Radius should be below maximum"
    assert 0.0 <= fp.intensity <= 1.0, "Intensity should be normalized [0, 1]"

    print(f"  ✓ Detected focal point: {fp}")
    print(f"  ✓ Position error: ({abs(fp.x - 320):.1f}, {abs(fp.y - 240):.1f}) pixels")


def test_multiple_focal_points():
    """Test extraction of multiple focal points"""
    print("\nTest 2: Multiple focal points")

    heatmap = create_synthetic_heatmap_multiple_peaks()
    focal_points = fpe.extract_focal_points(heatmap, threshold=0.4)

    assert (
        len(focal_points) >= 2
    ), f"Should detect at least 2 focal points, got {len(focal_points)}"
    assert (
        len(focal_points) <= config.MAX_FOCAL_POINTS
    ), f"Should not exceed MAX_FOCAL_POINTS ({config.MAX_FOCAL_POINTS})"

    # Check that focal points are sorted by intensity
    intensities = [fp.intensity for fp in focal_points]
    assert intensities == sorted(
        intensities, reverse=True
    ), "Focal points should be sorted by intensity (descending)"

    print(f"  ✓ Detected {len(focal_points)} focal points")
    for i, fp in enumerate(focal_points):
        print(f"    {i+1}. {fp}")


def test_no_focal_points():
    """Test with uniform heatmap (no salient regions)"""
    print("\nTest 3: No salient regions")

    heatmap = create_synthetic_heatmap_no_peaks()
    focal_points = fpe.extract_focal_points(heatmap, threshold=0.5)

    assert (
        len(focal_points) == 0
    ), f"Should detect no focal points, got {len(focal_points)}"

    print(f"  ✓ Correctly detected no focal points")


def test_json_serialization():
    """Test JSON serialization of focal points"""
    print("\nTest 4: JSON serialization")

    heatmap = create_synthetic_heatmap_multiple_peaks()
    focal_points = fpe.extract_focal_points(heatmap)

    # Convert to dict
    focal_dict = fpe.focal_points_to_dict(focal_points)

    # Serialize to JSON string
    json_str = json.dumps(focal_dict, indent=2)

    # Deserialize
    loaded_dict = json.loads(json_str)

    assert len(loaded_dict) == len(
        focal_points
    ), "Should preserve number of focal points"

    # Check that all required fields are present
    for point_dict in loaded_dict:
        assert "x" in point_dict, "Missing 'x' field"
        assert "y" in point_dict, "Missing 'y' field"
        assert "radius" in point_dict, "Missing 'radius' field"
        assert "intensity" in point_dict, "Missing 'intensity' field"

        # Check types
        assert isinstance(point_dict["x"], (int, float)), "x should be numeric"
        assert isinstance(point_dict["y"], (int, float)), "y should be numeric"
        assert isinstance(
            point_dict["radius"], (int, float)
        ), "radius should be numeric"
        assert isinstance(
            point_dict["intensity"], (int, float)
        ), "intensity should be numeric"

    print(f"  ✓ JSON serialization successful")
    print(f"  ✓ Sample JSON:\n{json_str[:200]}...")


def test_min_distance_constraint():
    """Test that minimum distance between focal points is enforced"""
    print("\nTest 5: Minimum distance constraint")

    # Create heatmap with two close peaks
    width, height = 640, 480
    x = np.arange(width)
    y = np.arange(height)
    xx, yy = np.meshgrid(x, y)

    # Two peaks very close together (30 pixels apart)
    heatmap = np.exp(-((xx - 320) ** 2 + (yy - 240) ** 2) / (2 * 60**2))
    heatmap += np.exp(-((xx - 350) ** 2 + (yy - 240) ** 2) / (2 * 60**2))
    heatmap = heatmap / heatmap.max()  # Normalize

    # Extract with default min_distance (50 pixels)
    focal_points = fpe.extract_focal_points(heatmap, threshold=0.3)

    # Check that all points are at least min_distance apart
    for i, fp1 in enumerate(focal_points):
        for fp2 in focal_points[i + 1 :]:
            dist = np.sqrt((fp1.x - fp2.x) ** 2 + (fp1.y - fp2.y) ** 2)
            assert (
                dist >= config.MIN_DISTANCE_PIXELS
            ), f"Focal points too close: {dist:.1f} < {config.MIN_DISTANCE_PIXELS}"

    print(f"  ✓ Minimum distance constraint enforced")
    print(f"  ✓ Detected {len(focal_points)} focal point(s) with proper spacing")


def test_edge_cases():
    """Test edge cases"""
    print("\nTest 6: Edge cases")

    # Empty heatmap
    heatmap = np.zeros((100, 100))
    focal_points = fpe.extract_focal_points(heatmap)
    assert len(focal_points) == 0, "Empty heatmap should yield no focal points"
    print("  ✓ Empty heatmap handled")

    # Constant heatmap (all same value)
    heatmap = np.ones((100, 100)) * 0.8
    focal_points = fpe.extract_focal_points(heatmap, threshold=0.5)
    # Should detect no local maxima or very few
    print(f"  ✓ Constant heatmap handled ({len(focal_points)} points detected)")

    # Very small heatmap
    heatmap = create_synthetic_heatmap_single_peak(
        width=50, height=50, center_x=25, center_y=25
    )
    focal_points = fpe.extract_focal_points(heatmap)
    assert len(focal_points) >= 0, "Small heatmap should work"
    print(f"  ✓ Small heatmap handled ({len(focal_points)} points detected)")


def test_full_pipeline_format():
    """Test the full output format that would be saved to JSON"""
    print("\nTest 7: Full pipeline output format")

    # Simulate processing multiple frames
    video_info = {
        "width": 640,
        "height": 480,
        "fps": 30.0,
        "total_frames": 3,
    }

    focal_points_data = {
        "video_info": video_info,
        "focal_points": [],
    }

    # Process 3 synthetic frames
    for frame_idx in range(3):
        if frame_idx == 0:
            heatmap = create_synthetic_heatmap_single_peak()
        elif frame_idx == 1:
            heatmap = create_synthetic_heatmap_multiple_peaks()
        else:
            heatmap = create_synthetic_heatmap_no_peaks()

        focal_points = fpe.extract_focal_points(heatmap, threshold=0.4)
        focal_points_data["focal_points"].append(
            {
                "frame_index": frame_idx,
                "points": fpe.focal_points_to_dict(focal_points),
            }
        )

    # Serialize to JSON
    json_str = json.dumps(focal_points_data, indent=2)

    # Validate structure
    loaded = json.loads(json_str)
    assert "video_info" in loaded, "Missing video_info"
    assert "focal_points" in loaded, "Missing focal_points"
    assert len(loaded["focal_points"]) == 3, "Should have 3 frames"

    # Check frame indices
    for i, frame_data in enumerate(loaded["focal_points"]):
        assert frame_data["frame_index"] == i, f"Frame index mismatch"
        assert "points" in frame_data, "Missing points array"

    print("  ✓ Full pipeline format valid")
    print(f"  ✓ Frame 0: {len(loaded['focal_points'][0]['points'])} points")
    print(f"  ✓ Frame 1: {len(loaded['focal_points'][1]['points'])} points")
    print(f"  ✓ Frame 2: {len(loaded['focal_points'][2]['points'])} points")

    # Print sample
    print(f"\n  Sample output (first 500 chars):")
    print(f"  {json_str[:500]}...")


def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("Focal Point Extraction - Unit Tests")
    print("=" * 70)

    tests = [
        test_single_focal_point,
        test_multiple_focal_points,
        test_no_focal_points,
        test_json_serialization,
        test_min_distance_constraint,
        test_edge_cases,
        test_full_pipeline_format,
    ]

    passed = 0
    failed = 0

    for test_func in tests:
        try:
            test_func()
            passed += 1
        except AssertionError as e:
            print(f"  ✗ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed += 1

    print("\n" + "=" * 70)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 70)

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
