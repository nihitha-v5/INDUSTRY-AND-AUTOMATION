from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.analytics import RootCauseResponse, BottleneckResponse, EconomicsResponse
from backend.app.services.root_cause_service import RootCauseService
from backend.app.services.bottleneck_service import BottleneckService
from backend.app.services.economic_service import EconomicService

router = APIRouter(prefix="/api/analysis", tags=["Industrial Analytics"])

@router.get("/root-cause", response_model=RootCauseResponse)
def get_root_cause_analysis(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return RootCauseService.analyze_root_cause(db, dataset_id)

@router.get("/bottlenecks", response_model=BottleneckResponse)
def get_bottleneck_analysis(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return BottleneckService.analyze_bottlenecks(db, dataset_id)

@router.get("/economics", response_model=EconomicsResponse)
def get_economic_analysis(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return EconomicService.analyze_economics(db, dataset_id)
