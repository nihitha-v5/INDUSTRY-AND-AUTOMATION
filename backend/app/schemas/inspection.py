from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class BoundingBox(BaseModel):
    x: float
    y: float
    w: float
    h: float
    confidence: float
    label: str

class InspectionResponse(BaseModel):
    id: Optional[int] = None
    image_name: str
    prediction: str  # ACCEPTABLE, DEFECTIVE, or specific category
    confidence: float
    confidence_percentage: str
    uncertainty_level: str  # LOW, MEDIUM, HIGH
    is_novel: bool
    novelty_warning: Optional[str] = None
    bounding_boxes: Optional[List[BoundingBox]] = None
    heatmap_available: bool = False
    localization_supported: bool = True
    localization_message: Optional[str] = None
    model_used: str
    created_at: Optional[datetime] = None

class BatchInspectionResponse(BaseModel):
    total_images: int
    processed_count: int
    acceptable_count: int
    defective_count: int
    uncertain_count: int
    results: List[InspectionResponse]
