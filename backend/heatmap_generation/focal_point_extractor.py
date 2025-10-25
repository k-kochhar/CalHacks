"""
Focal Point Extractor
======================

Extracts focal points (centers, radii, intensities) from saliency heatmaps.
These focal points represent the most salient regions in each frame.
"""

import numpy as np
from scipy import ndimage
from typing import List, Tuple, Dict
import config


class FocalPoint:
    """Represents a focal point in a frame"""

    def __init__(self, x: float, y: float, radius: float, intensity: float):
        self.x = float(x)
        self.y = float(y)
        self.radius = float(radius)
        self.intensity = float(intensity)

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "radius": round(self.radius, 2),
            "intensity": round(self.intensity, 4),
        }

    def __repr__(self):
        return f"FocalPoint(x={self.x:.1f}, y={self.y:.1f}, r={self.radius:.1f}, i={self.intensity:.3f})"


def find_local_maxima(
    heatmap: np.ndarray, threshold: float, min_distance: int
) -> List[Tuple[int, int, float]]:
    """
    Find local maxima in a 2D heatmap.

    Args:
        heatmap: 2D numpy array of saliency values (normalized 0-1)
        threshold: Minimum value to consider as a peak
        min_distance: Minimum distance between peaks in pixels

    Returns:
        List of (x, y, intensity) tuples for each local maximum
    """
    # Apply threshold
    thresholded = heatmap > threshold

    # Find local maxima using maximum filter
    # A pixel is a local maximum if it's equal to the max in its neighborhood
    neighborhood_size = max(3, min_distance)
    local_max = ndimage.maximum_filter(heatmap, size=neighborhood_size) == heatmap

    # Combine threshold and local maximum conditions
    peaks = thresholded & local_max

    # Get coordinates of peaks
    peak_coords = np.argwhere(peaks)

    if len(peak_coords) == 0:
        return []

    # Get intensities at peak locations
    peak_intensities = heatmap[peaks]

    # Combine coordinates and intensities
    # Note: argwhere returns (row, col) which is (y, x) in image coordinates
    peaks_with_intensity = [
        (int(coord[1]), int(coord[0]), float(intensity))
        for coord, intensity in zip(peak_coords, peak_intensities)
    ]

    # Sort by intensity (descending)
    peaks_with_intensity.sort(key=lambda p: p[2], reverse=True)

    # Apply min_distance constraint using greedy selection
    filtered_peaks = []
    for peak in peaks_with_intensity:
        x, y, intensity = peak

        # Check if this peak is far enough from all accepted peaks
        too_close = False
        for accepted_x, accepted_y, _ in filtered_peaks:
            dist_sq = (x - accepted_x) ** 2 + (y - accepted_y) ** 2
            if dist_sq < min_distance**2:
                too_close = True
                break

        if not too_close:
            filtered_peaks.append(peak)

    return filtered_peaks


def calculate_radius(
    heatmap: np.ndarray,
    center_x: int,
    center_y: int,
    peak_intensity: float,
    threshold_ratio: float,
) -> float:
    """
    Calculate the radius of influence for a focal point.

    Radius is defined as the average distance from center where intensity
    drops to threshold_ratio * peak_intensity.

    Args:
        heatmap: 2D saliency heatmap
        center_x: X coordinate of focal point center
        center_y: Y coordinate of focal point center
        peak_intensity: Intensity at the peak
        threshold_ratio: Ratio of peak intensity to define radius boundary

    Returns:
        Radius in pixels
    """
    height, width = heatmap.shape
    threshold_value = peak_intensity * threshold_ratio

    # Sample radial distances at multiple angles
    num_angles = 16
    angles = np.linspace(0, 2 * np.pi, num_angles, endpoint=False)

    radii = []
    max_search_radius = min(width, height) // 2

    for angle in angles:
        dx = np.cos(angle)
        dy = np.sin(angle)

        # Search along this ray for the threshold crossing
        for r in range(1, max_search_radius):
            x = int(center_x + r * dx)
            y = int(center_y + r * dy)

            # Check bounds
            if x < 0 or x >= width or y < 0 or y >= height:
                radii.append(r)
                break

            # Check if we've crossed the threshold
            if heatmap[y, x] < threshold_value:
                radii.append(r)
                break
        else:
            # Didn't find threshold crossing, use max search radius
            radii.append(max_search_radius)

    # Return average radius across all angles
    avg_radius = np.mean(radii)

    # Clamp to reasonable bounds
    avg_radius = max(
        config.MIN_RADIUS_PIXELS, min(config.MAX_RADIUS_PIXELS, avg_radius)
    )

    return float(avg_radius)


def extract_focal_points(
    heatmap: np.ndarray,
    threshold: float = None,
    min_distance: int = None,
    max_points: int = None,
    radius_threshold: float = None,
) -> List[FocalPoint]:
    """
    Extract focal points from a saliency heatmap.

    Args:
        heatmap: 2D numpy array of saliency values (H, W), should be normalized to [0, 1]
        threshold: Minimum intensity threshold (defaults to config.PEAK_THRESHOLD)
        min_distance: Minimum distance between focal points in pixels (defaults to config.MIN_DISTANCE_PIXELS)
        max_points: Maximum number of focal points to extract (defaults to config.MAX_FOCAL_POINTS)
        radius_threshold: Intensity ratio for radius calculation (defaults to config.RADIUS_INTENSITY_THRESHOLD)

    Returns:
        List of FocalPoint objects, sorted by intensity (highest first)
    """
    # Use config defaults if not specified
    if threshold is None:
        threshold = config.PEAK_THRESHOLD
    if min_distance is None:
        min_distance = config.MIN_DISTANCE_PIXELS
    if max_points is None:
        max_points = config.MAX_FOCAL_POINTS
    if radius_threshold is None:
        radius_threshold = config.RADIUS_INTENSITY_THRESHOLD

    # Ensure heatmap is normalized
    if heatmap.max() > 1.0 or heatmap.min() < 0.0:
        heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)

    # Find local maxima
    peaks = find_local_maxima(heatmap, threshold, min_distance)

    # Limit to max_points
    peaks = peaks[:max_points]

    # Calculate radii and create FocalPoint objects
    focal_points = []
    for x, y, intensity in peaks:
        radius = calculate_radius(heatmap, x, y, intensity, radius_threshold)
        focal_point = FocalPoint(x, y, radius, intensity)
        focal_points.append(focal_point)

    return focal_points


def focal_points_to_dict(focal_points: List[FocalPoint]) -> List[Dict]:
    """
    Convert a list of FocalPoint objects to a list of dictionaries for JSON serialization.

    Args:
        focal_points: List of FocalPoint objects

    Returns:
        List of dictionaries
    """
    return [fp.to_dict() for fp in focal_points]
