from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import cv2

class BaseModelAdapter(ABC):
    """
    Modular Adapter Interface for Uploaded Computer Vision Models.
    Supports Classification, Detection, and Segmentation models across frameworks.
    """
    def __init__(self, model_path: str, metadata: Optional[Dict[str, Any]] = None):
        self.model_path = model_path
        self.metadata = metadata or {}
        self.classes = self.metadata.get("classes", ["ACCEPTABLE", "DEFECTIVE"])
        self.input_shape = self.metadata.get("input_shape", (224, 224))
        self.is_loaded = False

    @abstractmethod
    def load(self) -> bool:
        """Load model weights and configuration."""
        pass

    @abstractmethod
    def predict(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Run inference on image numpy array (BGR from OpenCV).
        Must return standard format dict:
        {
          "prediction": str,
          "confidence": float,
          "uncertainty_level": str,
          "is_novel": bool,
          "bounding_boxes": List[Dict],
          "mask_contours": List[Dict],
          "localization_supported": bool,
          "localization_message": str
        }
        """
        pass

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Standard OpenCV image resizing and normalization."""
        if image is None:
            raise ValueError("Input image is None")
        h, w = self.input_shape[:2]
        resized = cv2.resize(image, (w, h))
        return resized
