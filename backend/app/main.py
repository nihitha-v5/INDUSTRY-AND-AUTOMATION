from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.session import engine, Base, SessionLocal
from backend.app.services.demo_service import init_demo_data

# Import API routers
from backend.app.api import (
    auth, datasets, models, inspection,
    analytics, simulation, recommendations,
    dashboard, reports, mongodb_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed demo dataset and active demo models
db = SessionLocal()
try:
    init_demo_data(db)
finally:
    db.close()

app = FastAPI(
    title=settings.APP_NAME,
    description="Software-only AI industrial decision-support system connecting Inspection Data, Production Data, and Economic Data.",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(models.router)
app.include_router(inspection.router)
app.include_router(analytics.router)
app.include_router(simulation.router)
app.include_router(recommendations.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(mongodb_router.router)

@app.get("/")
def root():
    return {
        "app_name": settings.APP_NAME,
        "status": "online",
        "hackathon": "NeuraX Hackathon 3.0",
        "domain": "Domain 2 – AI in Industry and Automation",
        "documentation": "/docs"
    }
