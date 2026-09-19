import os
import shutil
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.database.models import ModelRegistry, ModelType
from backend.app.schemas.model import ModelResponse, ModelActivateRequest
from backend.app.core.config import settings

router = APIRouter(prefix="/api/models", tags=["Model Management"])

@router.post("/upload", response_model=ModelResponse)
def upload_model(
    file: UploadFile = File(...),
    name: str = Form(...),
    version: str = Form("1.0.0"),
    framework: str = Form("yolo"),
    model_type: str = Form("detection"),
    classes_json: str = Form('["ACCEPTABLE", "DEFECTIVE"]'),
    input_dimensions: str = Form("640x640"),
    db: Session = Depends(get_db)
):
    safe_filename = f"{name.replace(' ', '_')}_{version}_{file.filename}"
    dest_path = os.path.join(settings.MODEL_PATH, safe_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        classes = json.loads(classes_json)
    except Exception:
        classes = ["ACCEPTABLE", "DEFECTIVE"]

    mtype = ModelType.DETECTION
    if model_type.lower() == "classification":
        mtype = ModelType.CLASSIFICATION
    elif model_type.lower() == "segmentation":
        mtype = ModelType.SEGMENTATION

    model_entry = ModelRegistry(
        name=name,
        version=version,
        framework=framework,
        model_type=mtype,
        classes=classes,
        input_dimensions=input_dimensions,
        file_path=dest_path,
        is_active=False,
        is_demo=False,
        metadata_json={
            "uploaded_filename": file.filename,
            "status": "Ready for deployment",
            "notes": "User uploaded computer vision weights"
        }
    )
    db.add(model_entry)
    db.commit()
    db.refresh(model_entry)
    return model_entry

@router.get("", response_model=List[ModelResponse])
def list_models(db: Session = Depends(get_db)):
    return db.query(ModelRegistry).order_by(ModelRegistry.created_at.desc()).all()

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(model_id: int, db: Session = Depends(get_db)):
    model = db.query(ModelRegistry).filter(ModelRegistry.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model

@router.post("/{model_id}/activate")
def activate_model(model_id: int, db: Session = Depends(get_db)):
    target = db.query(ModelRegistry).filter(ModelRegistry.id == model_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Model not found")

    # Deactivate all other models
    db.query(ModelRegistry).update({ModelRegistry.is_active: False})
    target.is_active = True
    db.commit()
    return {"status": "success", "message": f"Model '{target.name}' is now active."}
