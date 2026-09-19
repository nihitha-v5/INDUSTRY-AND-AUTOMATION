from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.schemas.simulation import SimulationRequest

class SimulationService:
    """
    Evaluates hypothetical process parameter adjustments (cycle time, station capacity, downtime reduction).
    Computes estimated changes in throughput, WIP accumulation, and financial impact.
    Explicitly labeled as advisory estimates.
    """

    @classmethod
    def run_simulation(cls, db: Session, req: SimulationRequest) -> Dict[str, Any]:
        target_station = req.target_station or "STATION_C (CNC Stamping)"
        sim_ct = req.simulated_cycle_time
        dt_reduction = req.downtime_reduction_pct or 0.0

        # Baseline reference defaults
        base_ct = 26.8
        base_uph = 115.0
        base_wip = 94
        base_scrap_cost = 14250.0
        base_margin = 78450.0

        # Calculate hypothetical simulated gains
        ct_ratio = base_ct / float(max(sim_ct, 1.0))
        sim_uph = round(base_uph * ct_ratio * (1.0 + (dt_reduction / 200.0)), 1)
        sim_wip = max(10, round(base_wip / (ct_ratio ** 0.8)))
        
        scrap_reduction_pct = min(0.60, max(0.0, (base_ct - sim_ct) * 0.05 + (dt_reduction * 0.005)))
        sim_scrap_cost = round(base_scrap_cost * (1.0 - scrap_reduction_pct), 2)
        scrap_savings = round(base_scrap_cost - sim_scrap_cost, 2)
        
        sim_margin = round(base_margin + (scrap_savings * 1.2) + ((sim_uph - base_uph) * 150.0), 2)

        chart_data = [
            {"metric": "Cycle Time (sec)", "Baseline": base_ct, "Simulated": sim_ct},
            {"metric": "Throughput (UPH)", "Baseline": base_uph, "Simulated": sim_uph},
            {"metric": "WIP Queue (units)", "Baseline": base_wip, "Simulated": sim_wip},
            {"metric": "Monthly Scrap ($)", "Baseline": base_scrap_cost, "Simulated": sim_scrap_cost},
            {"metric": "Profit Margin ($)", "Baseline": base_margin, "Simulated": sim_margin}
        ]

        return {
            "target_station": target_station,
            "baseline": {
                "cycle_time": base_ct,
                "throughput_uph": base_uph,
                "wip_queue": base_wip,
                "scrap_cost": base_scrap_cost,
                "estimated_margin": base_margin
            },
            "simulated": {
                "cycle_time": sim_ct,
                "throughput_uph": sim_uph,
                "wip_queue": sim_wip,
                "scrap_cost": sim_scrap_cost,
                "estimated_margin": sim_margin
            },
            "delta": {
                "cycle_time_diff": round(sim_ct - base_ct, 1),
                "throughput_gain_uph": round(sim_uph - base_uph, 1),
                "wip_reduction": base_wip - sim_wip,
                "scrap_cost_savings": scrap_savings,
                "margin_gain": round(sim_margin - base_margin, 2)
            },
            "chart_data": chart_data,
            "advisory_disclaimer": "All simulation results are hypothetical and advisory estimates. They do not guarantee real-world equipment output or control physical machines."
        }
