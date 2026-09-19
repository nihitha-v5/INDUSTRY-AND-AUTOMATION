from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.database.models import ModelType

class ModelResponse(BaseModel):
    id: int
    name: str
    version: str
    framework: str
    model_type: ModelType
    classes: Optional[List[str]] = None
    input_dimensions: str
    is_active: bool
    is_demo: bool
    created_at: datetime
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ModelActivateRequest(BaseModel):
    model_id: int
