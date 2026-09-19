from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class SimulationRequest(BaseModel):
    target_station: str
    simulated_cycle_time: float
    simulated_capacity: Optional[float] = None
    downtime_reduction_pct: Optional[float] = 0.0

class SimulationResponse(BaseModel):
    target_station: str
    baseline: Dict[str, Any]
    simulated: Dict[str, Any]
    delta: Dict[str, Any]
    chart_data: List[Dict[str, Any]] = []
    advisory_disclaimer: str = "All simulation results are hypothetical and advisory estimates. They do not guarantee real-world equipment output or control machines."
