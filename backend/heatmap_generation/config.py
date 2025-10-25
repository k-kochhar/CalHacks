"""
Configuration file for focal point extraction from saliency heatmaps
"""

# Focal Point Extraction Parameters
# ==================================

# Minimum normalized intensity threshold for considering a region as salient
# Values below this (0-1 range) will be ignored
PEAK_THRESHOLD = 0.5

# Minimum distance in pixels between detected focal points
# Prevents clustering of nearby peaks
MIN_DISTANCE_PIXELS = 50

# Maximum number of focal points to extract per frame
# Limits computational cost and keeps the most salient regions
MAX_FOCAL_POINTS = 5

# Intensity threshold for calculating focal point radius
# Radius is defined as distance where intensity drops to this fraction of peak value
RADIUS_INTENSITY_THRESHOLD = 0.5

# Minimum radius in pixels for a focal point
# Prevents overly small focal regions
MIN_RADIUS_PIXELS = 30

# Maximum radius in pixels for a focal point
# Prevents focal regions from becoming too large
MAX_RADIUS_PIXELS = 300

# Gaussian blur kernel size for heatmap smoothing (must be odd)
GAUSSIAN_KERNEL_SIZE = 11

# Gaussian blur sigma (0 = auto-calculate from kernel size)
GAUSSIAN_SIGMA = 0
