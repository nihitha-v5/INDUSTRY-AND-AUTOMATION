from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse
from backend.app.services.simulation_service import SimulationService

router = APIRouter(prefix="/api/simulation", tags=["What-If Simulation"])

@router.post("/run", response_model=SimulationResponse)
def run_what_if_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    return SimulationService.run_simulation(db, req)
