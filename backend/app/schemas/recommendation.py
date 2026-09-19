from pydantic import BaseModel
from typing import List, Optional

class RecommendationCard(BaseModel):
    id: int
    title: str
    observation: str
    evidence: str
    potential_association: str
    impact: str
    suggested_action: str
    simulation_result: Optional[str] = None
    confidence: str  # HIGH, MEDIUM, LOW
    limitations: str

class RecommendationListResponse(BaseModel):
    total_recommendations: int
    items: List[RecommendationCard]
    disclaimer: str = "Recommendations are data-driven advisory insights. They should be reviewed by manufacturing engineers prior to process modification."
