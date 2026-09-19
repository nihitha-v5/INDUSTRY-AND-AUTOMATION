import numpy as np
import cv2
from typing import Tuple

class NoveltyDetector:
    """
    Detects unusual, out-of-distribution, or novel inspection samples using image feature metrics.
    Prevents forcing highly uncertain/unseen samples into fixed defect classes.
    """
    def __init__(self, confidence_threshold: float = 0.50):
        self.confidence_threshold = confidence_threshold

    def evaluate_sample(self, image: np.ndarray, model_confidence: float) -> Tuple[bool, str, str]:
        """
        Evaluates sample for novelty or uncertainty.
        Returns: (is_novel, uncertainty_level, warning_message)
        """
        if image is None:
            return True, "HIGH", "Invalid or corrupt image stream."

        # Compute basic visual entropy & contrast metric via OpenCV
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        std_dev = np.std(gray)
        mean_val = np.mean(gray)

        # Extremely low contrast or saturated image
        is_extreme_lighting = std_dev < 10.0 or mean_val < 15 or mean_val > 240

        if model_confidence < self.confidence_threshold or is_extreme_lighting:
            is_novel = True
            uncertainty_level = "HIGH"
            warning_message = "Potentially novel / uncertain sample (Low model confidence or atypical image characteristics)."
        elif model_confidence < (self.confidence_threshold + 0.20):
            is_novel = False
            uncertainty_level = "MEDIUM"
            warning_message = "Moderate confidence sample. Human review recommended."
        else:
            is_novel = False
            uncertainty_level = "LOW"
            warning_message = None

        return is_novel, uncertainty_level, warning_message
