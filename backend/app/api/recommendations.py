from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.recommendation import RecommendationListResponse
from backend.app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/recommendations", tags=["Recommendation Engine"])

@router.get("", response_model=RecommendationListResponse)
def get_recommendations(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    items = RecommendationService.get_recommendations(db, dataset_id)
    return RecommendationListResponse(
        total_recommendations=len(items),
        items=items
    )
