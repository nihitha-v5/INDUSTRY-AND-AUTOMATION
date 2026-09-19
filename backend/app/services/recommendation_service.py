from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.database.models import RecommendationItem

class RecommendationService:
    """
    Synthesizes inspection findings, correlation evidence, bottleneck constraints, and simulations
    into structured advisory decision-support recommendations with explicit limitations.
    """

    @classmethod
    def get_recommendations(cls, db: Session, dataset_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = db.query(RecommendationItem)
        if dataset_id:
            query = query.filter(RecommendationItem.dataset_id == dataset_id)
        items = query.all()

        if not items:
            # Return demo recommendations
            return [
                {
                    "id": 1,
                    "title": "Station C Cycle Time & Tooling Calibration",
                    "observation": "Elevated defect occurrence (16.8% defect rate) was observed primarily under extended cycle time conditions at Station C.",
                    "evidence": "Observed statistical association (Pearson r = 0.74, p = 0.002) between Station C cycle time > 24 seconds and surface scratch frequency.",
                    "potential_association": "High thermal expansion during prolonged stamping cycle times may be associated with accelerated tool wear and surface pitting.",
                    "impact": "Current estimated scrap cost exposure is $14,250/month with 115 minutes of station downtime loss.",
                    "suggested_action": "Investigate tooling alignment at Station C (CNC Stamping) and evaluate a controlled reduction in cycle time from 26.8s to 20.0s.",
                    "simulation_result": "Simulated line throughput increases by +22.6 UPH with estimated monthly scrap savings of $5,400.",
                    "confidence": "HIGH",
                    "limitations": "Statistical correlation in tabular dataset does not strictly prove physical tool degradation. Physical metallurgical verification required before permanent tooling modification."
                },
                {
                    "id": 2,
                    "title": "Post-Downtime Warmup Quality Control at Station B",
                    "observation": "Spike in dimensional defect rates observed during the first 15 minutes following unscheduled station downtime.",
                    "evidence": "Temporal analysis indicates 42% of Station B defect records coincide with post-maintenance startup timestamps.",
                    "potential_association": "Thermal stabilization variance during machine re-ignition may be associated with transient dimensional tolerance deviations.",
                    "impact": "Contributes approximately $3,200/month in rework processing costs.",
                    "suggested_action": "Implement a 3-unit automated warm-up verification loop prior to routing production batches through Station B.",
                    "simulation_result": "Estimated rework cost reduction of $2,100/month with minimal +1.2 min startup delay.",
                    "confidence": "MEDIUM",
                    "limitations": "Limited temperature sensor granularity available in dataset. Requires additional thermal camera alignment."
                }
            ]

        results = []
        for rec in items:
            results.append({
                "id": rec.id,
                "title": f"Recommendation #{rec.id}",
                "observation": rec.observation,
                "evidence": rec.evidence,
                "potential_association": rec.potential_association,
                "impact": rec.impact,
                "suggested_action": rec.suggested_action,
                "simulation_result": rec.simulation_result,
                "confidence": rec.confidence,
                "limitations": rec.limitations
            })
        return results
