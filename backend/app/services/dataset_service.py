import os
import re
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.database.models import Dataset, DatasetColumn

class DatasetService:
    """
    Handles CSV/XLSX/JSON dataset file loading, schema profiling,
    and automatic semantic column identification.
    """

    SEMANTIC_PATTERNS = {
        "INSPECTION_IMAGE": [r"img", r"image", r"path", r"file", r"photo", r"picture", r"frame"],
        "LABEL": [r"label", r"target", r"ground_truth", r"actual", r"is_defect", r"quality_status"],
        "DEFECT_CLASS": [r"defect", r"class", r"category", r"type", r"anomaly_type", r"failure_mode"],
        "BOUNDING_BOX": [r"bbox", r"box", r"coords", r"location", r"rect", r"bounding_box"],
        "STATION": [r"station", r"machine", r"stage", r"line", r"cell", r"equipment", r"workstation"],
        "BATCH": [r"batch", r"lot", r"order", r"serial", r"run", r"job_id"],
        "CYCLE_TIME": [r"cycle_time", r"takt", r"duration", r"process_time", r"lead_time", r"seconds"],
        "UTILIZATION": [r"util", r"utilization", r"oee", r"up_time", r"capacity_used"],
        "DOWNTIME": [r"downtime", r"stoppage", r"breakdown", r"delay", r"idle_time", r"outage"],
        "WIP": [r"wip", r"queue", r"inventory", r"buffer", r"work_in_progress"],
        "THROUGHPUT": [r"throughput", r"output", r"units_per_hour", r"uph", r"rate", r"production_rate"],
        "PROCESS_PARAM": [r"temp", r"pressure", r"speed", r"vibration", r"torque", r"voltage", r"current", r"flow"],
        "UNIT_COST": [r"unit_cost", r"part_cost", r"manufacturing_cost"],
        "SCRAP_COST": [r"scrap", r"scrap_cost", r"waste_cost", r"rejection_cost"],
        "REWORK_COST": [r"rework", r"rework_cost", r"repair_cost"],
        "DOWNTIME_COST": [r"downtime_cost", r"loss_cost", r"delay_cost"],
        "REVENUE": [r"revenue", r"sales", r"price", r"income"],
        "MARGIN": [r"margin", r"profit", r"gain", r"net_value"]
    }

    @classmethod
    def profile_dataframe(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        columns_profile = []
        for col in df.columns:
            series = df[col]
            dtype_str = str(series.dtype)
            missing_cnt = int(series.isna().sum())
            unique_cnt = int(series.nunique())
            
            # Extract up to 3 sample non-null values safely
            sample_vals = series.dropna().head(3).tolist()
            # Convert numpy types to python native for JSON serialization
            sample_vals = [int(v) if isinstance(v, (np.int64, np.int32)) else (float(v) if isinstance(v, (np.float64, np.float32)) else str(v)) for v in sample_vals]

            # Auto-detect possible semantic role
            detected_role = cls.detect_semantic_role(col, dtype_str, sample_vals)

            columns_profile.append({
                "column_name": str(col),
                "data_type": dtype_str,
                "missing_count": missing_cnt,
                "unique_count": unique_cnt,
                "sample_values": sample_vals,
                "semantic_role": detected_role
            })
        return columns_profile

    @classmethod
    def detect_semantic_role(cls, col_name: str, dtype_str: str, sample_vals: List[Any]) -> Optional[str]:
        clean_name = col_name.lower().strip().replace(" ", "_")

        for role, patterns in cls.SEMANTIC_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, clean_name):
                    return role

        # Check sample strings for image extension patterns
        if sample_vals and isinstance(sample_vals[0], str):
            first_val = sample_vals[0].lower()
            if any(first_val.endswith(ext) for ext in [".jpg", ".png", ".jpeg", ".bmp", ".tif"]):
                return "INSPECTION_IMAGE"

        return None

    @classmethod
    def process_zip_archive(cls, zip_path: str, extract_dir: str) -> Tuple[pd.DataFrame, str]:
        """
        Extracts a ZIP archive, locates tabular CSV/XLSX/JSON files if present.
        If only images are found, automatically synthesizes an image dataset table
        with folder-based defect classes and labels.
        """
        import zipfile
        import shutil

        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extract_dir)

        # 1. Search for tabular files first
        tabular_files = []
        image_files = []
        image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}

        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                f_ext = os.path.splitext(file)[1].lower()
                f_path = os.path.join(root, file)
                if f_ext in [".csv", ".xlsx", ".xls", ".json"]:
                    tabular_files.append(f_path)
                elif f_ext in image_exts:
                    image_files.append(f_path)

        if tabular_files:
            # Prefer CSV if available, or first tabular file
            csv_files = [f for f in tabular_files if f.endswith(".csv")]
            main_tabular = csv_files[0] if csv_files else tabular_files[0]
            df = cls.load_dataset_file(main_tabular)
            return df, main_tabular

        if image_files:
            # Generate dataset from image structure
            records = []
            for img_path in image_files:
                rel_path = os.path.relpath(img_path, extract_dir).replace("\\", "/")
                img_name = os.path.basename(img_path)
                parent_folder = os.path.basename(os.path.dirname(img_path))
                
                # Derive class from parent folder or filename
                folder_lower = parent_folder.lower() if parent_folder != os.path.basename(extract_dir) else ""
                name_lower = img_name.lower()

                if "normal" in folder_lower or "normal" in name_lower or "good" in folder_lower or "ok" in folder_lower:
                    defect_class = "Normal"
                    quality_status = "ACCEPTABLE"
                elif "scratch" in folder_lower or "scratch" in name_lower:
                    defect_class = "Scratches"
                    quality_status = "DEFECTIVE"
                elif "rust" in folder_lower or "rust" in name_lower:
                    defect_class = "Rust"
                    quality_status = "DEFECTIVE"
                elif "hole" in folder_lower or "hole" in name_lower:
                    defect_class = "Hole"
                    quality_status = "DEFECTIVE"
                elif "crack" in folder_lower or "crack" in name_lower:
                    defect_class = "Crack"
                    quality_status = "DEFECTIVE"
                elif folder_lower:
                    defect_class = parent_folder.title()
                    quality_status = "DEFECTIVE"
                else:
                    defect_class = "Anomaly"
                    quality_status = "DEFECTIVE"

                records.append({
                    "image_name": img_name,
                    "image_path": rel_path,
                    "defect_class": defect_class,
                    "quality_status": quality_status,
                    "station_id": "STATION_C",
                    "cycle_time": 24.5,
                    "utilization": 88.0,
                    "downtime_minutes": 10.0,
                    "scrap_cost": 45.0 if quality_status == "DEFECTIVE" else 0.0,
                    "rework_cost": 15.0 if quality_status == "DEFECTIVE" else 0.0
                })

            df = pd.DataFrame(records)
            gen_csv_path = os.path.join(extract_dir, "dataset_index.csv")
            df.to_csv(gen_csv_path, index=False)
            return df, gen_csv_path

        raise ValueError("No tabular data (.csv, .xlsx, .json) or images found in ZIP archive.")

    @classmethod
    def load_dataset_file(cls, file_path: str) -> pd.DataFrame:
        ext = os.path.splitext(file_path)[1].lower()
        if ext in [".csv"]:
            return pd.read_csv(file_path)
        elif ext in [".xlsx", ".xls"]:
            return pd.read_excel(file_path)
        elif ext in [".json"]:
            return pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported tabular data format: {ext}")
