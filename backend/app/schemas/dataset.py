from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class DatasetColumnResponse(BaseModel):
    id: int
    column_name: str
    data_type: str
    missing_count: int
    unique_count: int
    sample_values: Optional[List[Any]] = None
    semantic_role: Optional[str] = None

    class Config:
        from_attributes = True

class DatasetResponse(BaseModel):
    id: int
    name: str
    file_type: str
    row_count: int
    column_count: int
    is_demo: bool
    is_active: bool
    status: str
    created_at: datetime
    columns: List[DatasetColumnResponse] = []

    class Config:
        from_attributes = True

class ColumnMappingItem(BaseModel):
    column_name: str
    semantic_role: str

class ColumnMappingRequest(BaseModel):
    mappings: List[ColumnMappingItem]

class DataQualityReport(BaseModel):
    dataset_name: str
    row_count: int
    column_count: int
    missing_values_total: int
    duplicate_rows: int
    invalid_records: int
    images_available: int
    labels_available: int
    warnings: List[str]
    column_issues: Dict[str, List[str]]
