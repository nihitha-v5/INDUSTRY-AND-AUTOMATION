from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.database.models import Dataset, InspectionPrediction
from backend.app.schemas.analytics import DashboardSummaryResponse, QualityMetricItem
from backend.app.services.bottleneck_service import BottleneckService
from backend.app.services.economic_service import EconomicService
from backend.app.services.column_mapping_service import ColumnMappingService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    active_dataset = None
    if dataset_id:
        active_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    else:
        active_dataset = db.query(Dataset).filter(Dataset.is_active == True).first()

    is_demo = active_dataset.is_demo if active_dataset else True
    role_map = ColumnMappingService.get_mappings_by_role(db, active_dataset.id) if (active_dataset and not is_demo) else {}

    # Helper function to build QualityMetricItem dynamically
    def make_metric(label: str, value: Optional[any], unit: str = "", req_role: Optional[str] = None):
        if not is_demo and req_role and req_role not in role_map:
            return QualityMetricItem(
                label=label,
                value=None,
                unit=unit,
                is_available=False,
                notice="Not available in uploaded dataset"
            )
        return QualityMetricItem(
            label=label,
            value=value,
            unit=unit,
            is_available=True,
            notice=None
        )

    b_res = BottleneckService.analyze_bottlenecks(db, active_dataset.id if active_dataset else None)
    e_res = EconomicService.analyze_economics(db, active_dataset.id if active_dataset else None)

    # Fetch recent inspection predictions
    preds = db.query(InspectionPrediction).order_by(InspectionPrediction.created_at.desc()).limit(5).all()
    recent = []
    for p in preds:
        recent.append({
            "id": p.id,
            "image_name": p.image_name,
            "prediction": p.prediction,
            "confidence": f"{round(p.confidence * 100, 1)}%",
            "uncertainty_level": p.uncertainty_level,
            "is_novel": p.is_novel,
            "station": p.station_id or "STATION_C",
            "time": p.created_at.strftime("%H:%M:%S")
        })

    return DashboardSummaryResponse(
        is_demo=is_demo,
        total_units=make_metric("Total Units Produced", 1200, "units"),
        inspected_units=make_metric("Inspected Units", 400, "units", "INSPECTION_IMAGE"),
        accepted_units=make_metric("Accepted Units", 332, "units", "LABEL"),
        defective_units=make_metric("Defective Units", 68, "units", "DEFECT_CLASS"),
        defect_rate=make_metric("Defect Rate", 16.8, "%", "DEFECT_CLASS"),
        current_throughput=make_metric("Current Throughput", 115.0, "UPH", "THROUGHPUT"),
        wip=make_metric("Work-In-Progress (WIP)", 94, "units", "WIP"),
        bottleneck_station=make_metric("Bottleneck Station", b_res.get("primary_bottleneck", "STATION_C (CNC Stamping)"), "", "STATION"),
        avg_cycle_time=make_metric("Average Cycle Time", 26.8, "sec", "CYCLE_TIME"),
        utilization=make_metric("Station Utilization", 96.4, "%", "UTILIZATION"),
        downtime=make_metric("Station Downtime", 115.0, "mins", "DOWNTIME"),
        scrap_cost=make_metric("Scrap Cost Loss", e_res.get("scrap_cost"), "$", "SCRAP_COST"),
        rework_cost=make_metric("Rework Cost Loss", e_res.get("rework_cost"), "$", "REWORK_COST"),
        downtime_loss=make_metric("Downtime Financial Loss", e_res.get("downtime_loss"), "$", "DOWNTIME_COST"),
        production_loss=make_metric("Production Losses", e_res.get("production_loss"), "$", "SCRAP_COST"),
        revenue=make_metric("Estimated Line Revenue", e_res.get("revenue"), "$", "REVENUE"),
        estimated_margin=make_metric("Estimated Margin", e_res.get("estimated_margin"), "$", "MARGIN"),

        defect_distribution=[
            {"name": "Surface Scratch", "value": 34, "color": "#f59e0b"},
            {"name": "Dimensional Defect", "value": 18, "color": "#ef4444"},
            {"name": "Porosity", "value": 12, "color": "#8b5cf6"},
            {"name": "Crack", "value": 4, "color": "#ec4899"}
        ],
        station_performance=[
            {"station": "Station A", "cycle_time": 8.5, "utilization": 72.0, "throughput": 220.0},
            {"station": "Station B", "cycle_time": 14.2, "utilization": 81.5, "throughput": 190.0},
            {"station": "Station C (Bottleneck)", "cycle_time": 26.8, "utilization": 96.4, "throughput": 115.0},
            {"station": "Station D", "cycle_time": 11.0, "utilization": 68.0, "throughput": 175.0},
            {"station": "Station E", "cycle_time": 9.2, "utilization": 75.0, "throughput": 210.0}
        ],
        quality_trend=[
            {"hour": "08:00", "defect_rate": 4.2, "throughput": 140},
            {"hour": "10:00", "defect_rate": 8.5, "throughput": 132},
            {"hour": "12:00", "defect_rate": 16.8, "throughput": 115},
            {"hour": "14:00", "defect_rate": 14.1, "throughput": 120},
            {"hour": "16:00", "defect_rate": 11.5, "throughput": 128}
        ],
        recent_inspections=recent
    )
