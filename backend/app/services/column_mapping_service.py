from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from backend.app.database.models import Dataset, DatasetColumn

class ColumnMappingService:
    """
    Stores, retrieves, and maps dataset columns to standard pipeline semantic roles.
    Allows downstream analytics to use semantic aliases instead of hardcoded column names.
    """

    @classmethod
    def get_mappings_by_role(cls, db: Session, dataset_id: int) -> Dict[str, str]:
        """
        Returns dict mapping semantic_role -> column_name
        e.g. {"STATION": "machine_id", "CYCLE_TIME": "process_duration_sec"}
        """
        columns = db.query(DatasetColumn).filter(DatasetColumn.dataset_id == dataset_id).all()
        role_to_col = {}
        for col in columns:
            if col.semantic_role:
                role_to_col[col.semantic_role] = col.column_name
        return role_to_col

    @classmethod
    def update_mappings(cls, db: Session, dataset_id: int, mappings: List[Dict[str, str]]) -> bool:
        for item in mappings:
            col_name = item.get("column_name")
            role = item.get("semantic_role")
            
            db_col = db.query(DatasetColumn).filter(
                DatasetColumn.dataset_id == dataset_id,
                DatasetColumn.column_name == col_name
            ).first()

            if db_col:
                db_col.semantic_role = role

        db.commit()
        return True
