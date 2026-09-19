import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

class DataProcessingStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ModelType(str, enum.Enum):
    CLASSIFICATION = "classification"
    DETECTION = "detection"
    SEGMENTATION = "segmentation"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.ANALYST, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # csv, xlsx, json, zip, folder
    file_path = Column(String, nullable=False)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    is_demo = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    status = Column(String, default="RAW")  # RAW, PROFILED, VALIDATED, PROCESSED
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    columns = relationship("DatasetColumn", back_populates="dataset", cascade="all, delete-orphan")
    jobs = relationship("DataProcessingJob", back_populates="dataset", cascade="all, delete-orphan")

class DatasetColumn(Base):
    __tablename__ = "dataset_columns"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    column_name = Column(String, nullable=False)
    data_type = Column(String, nullable=False)  # int, float, string, datetime, category
    missing_count = Column(Integer, default=0)
    unique_count = Column(Integer, default=0)
    sample_values = Column(JSON, nullable=True)
    
    # Semantic mapping role
    semantic_role = Column(String, nullable=True) 
    # Roles: INSPECTION_IMAGE, LABEL, DEFECT_CLASS, BOUNDING_BOX, STATION, BATCH, CYCLE_TIME, UTILIZATION, DOWNTIME, WIP, THROUGHPUT, PROCESS_PARAM, UNIT_COST, SCRAP_COST, REWORK_COST, DOWNTIME_COST, REVENUE, MARGIN

    dataset = relationship("Dataset", back_populates="columns")

class DataProcessingJob(Base):
    __tablename__ = "data_processing_jobs"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    job_type = Column(String, nullable=False)  # PROFILE, VALIDATE, PROCESS
    status = Column(SQLEnum(DataProcessingStatus), default=DataProcessingStatus.QUEUED)
    progress_percentage = Column(Float, default=0.0)
    log_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    dataset = relationship("Dataset", back_populates="jobs")

class ModelRegistry(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, default="1.0.0")
    framework = Column(String, nullable=False)  # pytorch, tensorflow, yolo, sklearn, custom
    model_type = Column(SQLEnum(ModelType), default=ModelType.CLASSIFICATION)
    classes = Column(JSON, nullable=True)  # List of defect classes
    input_dimensions = Column(String, default="224x224")
    file_path = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, nullable=True)

class InspectionPrediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    image_name = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    prediction = Column(String, nullable=False)  # ACCEPTABLE, DEFECTIVE, or class name
    confidence = Column(Float, nullable=False)
    uncertainty_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH
    is_novel = Column(Boolean, default=False)
    bounding_boxes = Column(JSON, nullable=True)
    mask_contours = Column(JSON, nullable=True)
    ground_truth = Column(String, nullable=True)
    station_id = Column(String, nullable=True)
    batch_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductionRecord(Base):
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    station_id = Column(String, nullable=False)
    batch_id = Column(String, nullable=True)
    cycle_time = Column(Float, nullable=True)
    utilization_pct = Column(Float, nullable=True)
    downtime_minutes = Column(Float, nullable=True)
    wip_count = Column(Integer, nullable=True)
    throughput = Column(Float, nullable=True)
    process_param_value = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class EconomicRecord(Base):
    __tablename__ = "economic_records"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    unit_cost = Column(Float, nullable=True)
    scrap_cost = Column(Float, nullable=True)
    rework_cost = Column(Float, nullable=True)
    downtime_cost = Column(Float, nullable=True)
    revenue = Column(Float, nullable=True)
    margin = Column(Float, nullable=True)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    analysis_type = Column(String, nullable=False)  # ROOT_CAUSE, BOTTLENECK, ECONOMICS, MODEL_PERFORMANCE
    results_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SimulationRecord(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    scenario_name = Column(String, nullable=False)
    target_station = Column(String, nullable=False)
    baseline_cycle_time = Column(Float, nullable=False)
    simulated_cycle_time = Column(Float, nullable=False)
    baseline_throughput = Column(Float, nullable=False)
    simulated_throughput = Column(Float, nullable=False)
    baseline_margin = Column(Float, nullable=True)
    simulated_margin = Column(Float, nullable=True)
    estimated_cost_saving = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RecommendationItem(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    observation = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)
    potential_association = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    simulation_result = Column(Text, nullable=True)
    confidence = Column(String, default="HIGH")  # HIGH, MEDIUM, LOW
    limitations = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
