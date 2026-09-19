import os
import shutil
import cv2
import numpy as np
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.database.models import ModelRegistry, InspectionPrediction, ModelType
from backend.app.schemas.inspection import InspectionResponse, BatchInspectionResponse
from backend.app.ml.classification_adapter import ClassificationAdapter
from backend.app.ml.detection_adapter import DetectionAdapter
from backend.app.ml.segmentation_adapter import SegmentationAdapter
from backend.app.core.config import settings

router = APIRouter(prefix="/api/inspection", tags=["Visual Inspection"])

def get_active_adapter(db: Session):
    active_model = db.query(ModelRegistry).filter(ModelRegistry.is_active == True).first()
    if not active_model:
        # Default fallback adapter
        return DetectionAdapter("models/uploaded/demo_yolo_v1.pt", {
            "classes": ["ACCEPTABLE", "SURFACE_SCRATCH", "DIMENSIONAL_DEFECT", "POROSITY"],
            "input_shape": (640, 640)
        }), "Industrial CV Defect Detector v1.2 (Demo)"

    meta = active_model.metadata_json or {}
    meta["classes"] = active_model.classes or ["ACCEPTABLE", "DEFECTIVE"]

    if active_model.model_type == ModelType.CLASSIFICATION:
        adapter = ClassificationAdapter(active_model.file_path, meta)
    elif active_model.model_type == ModelType.SEGMENTATION:
        adapter = SegmentationAdapter(active_model.file_path, meta)
    else:
        adapter = DetectionAdapter(active_model.file_path, meta)

    return adapter, active_model.name

from fastapi.responses import FileResponse

@router.get("/upload/{filename}")
def get_uploaded_image(filename: str):
    file_path = os.path.join(settings.UPLOAD_DATA_PATH, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")

@router.post("/predict", response_model=InspectionResponse)
def run_inspection(
    file: UploadFile = File(...),
    station_id: str = Form("STATION_C (CNC Stamping)"),
    batch_id: str = Form("BATCH-2026-RUN"),
    db: Session = Depends(get_db)
):
    # Save uploaded image locally
    safe_name = f"inspect_{file.filename}"
    img_path = os.path.join(settings.UPLOAD_DATA_PATH, safe_name)
    with open(img_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    # Read image with OpenCV
    img = cv2.imread(img_path)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file or corrupted image stream.")

    adapter, model_name = get_active_adapter(db)
    res = adapter.predict(img, file.filename)

    # Save prediction to DB
    pred_entry = InspectionPrediction(
        image_name=file.filename,
        image_path=img_path,
        prediction=res["prediction"],
        confidence=res["confidence"],
        uncertainty_level=res["uncertainty_level"],
        is_novel=res["is_novel"],
        bounding_boxes=res["bounding_boxes"],
        station_id=station_id,
        batch_id=batch_id
    )
    db.add(pred_entry)
    db.commit()
    db.refresh(pred_entry)

    return InspectionResponse(
        id=pred_entry.id,
        image_name=file.filename,
        prediction=res["prediction"],
        confidence=res["confidence"],
        confidence_percentage=res["confidence_percentage"],
        uncertainty_level=res["uncertainty_level"],
        is_novel=res["is_novel"],
        novelty_warning=res["novelty_warning"],
        bounding_boxes=res["bounding_boxes"],
        heatmap_available=True,
        localization_supported=res["localization_supported"],
        localization_message=res["localization_message"],
        model_used=model_name,
        created_at=pred_entry.created_at
    )

@router.post("/batch-predict", response_model=BatchInspectionResponse)
def run_batch_inspection(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    adapter, model_name = get_active_adapter(db)
    results = []
    acceptable = 0
    defective = 0
    uncertain = 0

    for file in files:
        img_path = os.path.join(settings.UPLOAD_DATA_PATH, f"batch_{file.filename}")
        with open(img_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        img = cv2.imread(img_path)
        if img is not None:
            res = adapter.predict(img, file.filename)
            pred_upper = str(res["prediction"]).upper()
            if "ACCEPTABLE" in pred_upper or "NORMAL" in pred_upper:
                acceptable += 1
            else:
                defective += 1
            if res["is_novel"] or res["uncertainty_level"] == "HIGH":
                uncertain += 1

            results.append(InspectionResponse(
                image_name=file.filename,
                prediction=res["prediction"],
                confidence=res["confidence"],
                confidence_percentage=res["confidence_percentage"],
                uncertainty_level=res["uncertainty_level"],
                is_novel=res["is_novel"],
                novelty_warning=res["novelty_warning"],
                bounding_boxes=res["bounding_boxes"],
                localization_supported=res["localization_supported"],
                localization_message=res["localization_message"],
                model_used=model_name
            ))

    return BatchInspectionResponse(
        total_images=len(files),
        processed_count=len(results),
        acceptable_count=acceptable,
        defective_count=defective,
        uncertain_count=uncertain,
        results=results
    )
