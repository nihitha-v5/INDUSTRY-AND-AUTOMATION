from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.database.models import InspectionPrediction
from backend.app.database.mongodb import get_sync_mongo_db, test_mongo_connection

router = APIRouter(prefix="/api/mongodb", tags=["MongoDB Integration"])

class MongoLogEntry(BaseModel):
    event_type: str
    source: str
    payload: Dict[str, Any]

@router.get("/status")
def get_mongodb_status():
    """Returns MongoDB Atlas connectivity and cluster information."""
    result = test_mongo_connection()
    return result

@router.post("/logs")
def save_telemetry_log(entry: MongoLogEntry):
    """Saves telemetry / inspection logs directly to MongoDB."""
    db = get_sync_mongo_db()
    if db is None:
        raise HTTPException(status_code=503, detail="MongoDB is not connected or configured.")
    
    doc = {
        "event_type": entry.event_type,
        "source": entry.source,
        "payload": entry.payload,
        "created_at": datetime.utcnow()
    }
    insert_result = db.telemetry_logs.insert_one(doc)
    return {
        "status": "success",
        "inserted_id": str(insert_result.inserted_id),
        "message": "Telemetry document stored in MongoDB successfully."
    }

@router.get("/logs")
def get_telemetry_logs(limit: int = Query(20, ge=1, le=100)):
    """Fetches recent telemetry logs from MongoDB."""
    db = get_sync_mongo_db()
    if db is None:
        raise HTTPException(status_code=503, detail="MongoDB is not connected or configured.")
    
    logs = list(db.telemetry_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))
    return {"status": "success", "count": len(logs), "logs": logs}

@router.post("/sync-inspections")
def sync_inspections_to_mongodb(db_session: Session = Depends(get_db)):
    """Syncs recent inspection predictions from SQLite to MongoDB Atlas collection."""
    mongo_db = get_sync_mongo_db()
    if mongo_db is None:
        raise HTTPException(status_code=503, detail="MongoDB is not connected or configured.")
    
    preds = db_session.query(InspectionPrediction).all()
    count = 0
    for p in preds:
        doc = {
            "prediction_id": p.id,
            "image_name": p.image_name,
            "prediction": p.prediction,
            "confidence": p.confidence,
            "uncertainty_level": p.uncertainty_level,
            "is_novel": p.is_novel,
            "station_id": p.station_id,
            "bounding_boxes": p.bounding_boxes,
            "synced_at": datetime.utcnow()
        }
        mongo_db.inspections.update_one(
            {"prediction_id": p.id},
            {"$set": doc},
            upsert=True
        )
        count += 1

    return {
        "status": "success",
        "synced_count": count,
        "collection": "inspections",
        "message": f"Successfully synced {count} inspections to MongoDB Atlas."
    }
