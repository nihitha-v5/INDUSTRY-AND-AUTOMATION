from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QualityMetricItem(BaseModel):
    label: str
    value: Optional[Any] = None
    unit: Optional[str] = ""
    is_available: bool = True
    notice: Optional[str] = None

class DashboardSummaryResponse(BaseModel):
    is_demo: bool
    total_units: QualityMetricItem
    inspected_units: QualityMetricItem
    accepted_units: QualityMetricItem
    defective_units: QualityMetricItem
    defect_rate: QualityMetricItem
    current_throughput: QualityMetricItem
    wip: QualityMetricItem
    bottleneck_station: QualityMetricItem
    avg_cycle_time: QualityMetricItem
    utilization: QualityMetricItem
    downtime: QualityMetricItem
    scrap_cost: QualityMetricItem
    rework_cost: QualityMetricItem
    downtime_loss: QualityMetricItem
    production_loss: QualityMetricItem
    revenue: QualityMetricItem
    estimated_margin: QualityMetricItem

    defect_distribution: List[Dict[str, Any]] = []
    station_performance: List[Dict[str, Any]] = []
    quality_trend: List[Dict[str, Any]] = []
    recent_inspections: List[Dict[str, Any]] = []

class CorrelationItem(BaseModel):
    feature1: str
    feature2: str
    coefficient: float
    p_value: Optional[float] = None
    interpretation: str

class RootCauseResponse(BaseModel):
    correlations: List[CorrelationItem] = []
    station_defect_rates: List[Dict[str, Any]] = []
    feature_importance: List[Dict[str, Any]] = []
    key_findings: List[str] = []
    evidence_notes: List[str] = []

class StationMetrics(BaseModel):
    station: str
    cycle_time: Optional[float] = None
    utilization_pct: Optional[float] = None
    wip: Optional[int] = None
    downtime_mins: Optional[float] = None
    throughput: Optional[float] = None
    is_bottleneck: bool = False

class BottleneckResponse(BaseModel):
    stations: List[StationMetrics] = []
    primary_bottleneck: Optional[str] = None
    capacity_constraint_rank: List[str] = []
    notes: List[str] = []

class EconomicsResponse(BaseModel):
    scrap_cost: Optional[float] = None
    rework_cost: Optional[float] = None
    downtime_loss: Optional[float] = None
    production_loss: Optional[float] = None
    revenue: Optional[float] = None
    estimated_margin: Optional[float] = None
    estimated_profit: Optional[float] = None
    is_data_available: bool = True
    unsupported_fields: List[str] = []
    cost_breakdown: List[Dict[str, Any]] = []
