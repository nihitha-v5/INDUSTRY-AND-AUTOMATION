import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "VISUAL INSPECTION & DEFECT ROOT-CAUSE ASSISTANT"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    SECRET_KEY: str = "neurax_hackathon_super_secret_jwt_key_2026_industrial_analytics"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    DATABASE_URL: str = "sqlite:///./app.db"
    MONGODB_URL: Optional[str] = None
    MONGODB_DB_NAME: str = "auronix"

    RAW_DATA_PATH: str = "data/raw"
    PROCESSED_DATA_PATH: str = "data/processed"
    UPLOAD_DATA_PATH: str = "data/uploads"
    REPORT_DATA_PATH: str = "data/reports"
    MODEL_PATH: str = "models/uploaded"
    ACTIVE_MODEL_PATH: str = "models/active"

    CONFIDENCE_THRESHOLD: float = 0.50
    ENABLE_ROOT_CAUSE_ANALYSIS: bool = True
    ENABLE_BOTTLENECK_ANALYSIS: bool = True
    ENABLE_ECONOMIC_ANALYSIS: bool = True
    ENABLE_WHAT_IF_SIMULATION: bool = True

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure required directories exist
for folder in [
    settings.RAW_DATA_PATH,
    settings.PROCESSED_DATA_PATH,
    settings.UPLOAD_DATA_PATH,
    settings.REPORT_DATA_PATH,
    settings.MODEL_PATH,
    settings.ACTIVE_MODEL_PATH
]:
    os.makedirs(folder, exist_ok=True)
