import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.database.models import (
    User, UserRole, Dataset, DatasetColumn, ModelRegistry, ModelType,
    InspectionPrediction, ProductionRecord, EconomicRecord, SimulationRecord,
    RecommendationItem
)
from backend.app.core.security import get_password_hash

def init_demo_data(db: Session):
    """
    Initializes standard Demo Users, Demo Dataset (labeled 'DEMO DATA - NOT ORGANIZER DATA'),
    Demo Computer Vision Models, and Demo Production/Economic records.
    """
    # 1. Create Default Demo Users if not present
    admin = db.query(User).filter(User.email == "admin@neurax.ai").first()
    if not admin:
        admin = User(
            email="admin@neurax.ai",
            full_name="Industrial Admin",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin)

    analyst = db.query(User).filter(User.email == "analyst@neurax.ai").first()
    if not analyst:
        analyst = User(
            email="analyst@neurax.ai",
            full_name="Quality Analyst",
            hashed_password=get_password_hash("analyst123"),
            role=UserRole.ANALYST
        )
        db.add(analyst)

    viewer = db.query(User).filter(User.email == "viewer@neurax.ai").first()
    if not viewer:
        viewer = User(
            email="viewer@neurax.ai",
            full_name="Plant Executive",
            hashed_password=get_password_hash("viewer123"),
            role=UserRole.VIEWER
        )
        db.add(viewer)

    db.commit()

    # 2. Create Demo Model Registry Entries if not present
    existing_model = db.query(ModelRegistry).filter(ModelRegistry.name == "Industrial CV Defect Detector v1.2").first()
    if not existing_model:
        demo_model = ModelRegistry(
            name="Industrial CV Defect Detector v1.2",
            version="1.2.0",
            framework="yolo",
            model_type=ModelType.DETECTION,
            classes=["ACCEPTABLE", "SURFACE_SCRATCH", "DIMENSIONAL_DEFECT", "POROSITY", "CRACK"],
            input_dimensions="640x640",
            file_path="models/uploaded/demo_yolo_v1.pt",
            is_active=True,
            is_demo=True,
            metadata_json={
                "trained_on": "Demo Synthetic Metal Castings Dataset",
                "accuracy": 0.942,
                "precision": 0.931,
                "recall": 0.925,
                "f1_score": 0.928,
                "notes": "PRE-LOADED DEMO MODEL - REPLACE WITH ORGANIZER TRAINED MODEL"
            }
        )
        db.add(demo_model)
        db.commit()

    # 3. Create Demo Dataset if not present
    existing_dataset = db.query(Dataset).filter(Dataset.name == "Demo Industrial Dataset (Multi-Stage Manufacturing)").first()
    if not existing_dataset:
        dataset = Dataset(
            name="Demo Industrial Dataset (Multi-Stage Manufacturing)",
            file_type="csv",
            file_path="data/raw/demo_manufacturing_data.csv",
            row_count=1200,
            column_count=14,
            is_demo=True,
            is_active=True,
            status="PROCESSED"
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        # Seed Dataset Columns with Semantic Mappings
        column_specs = [
            ("unit_id", "string", 0, 1200, ["U-1001", "U-1002"], "INSPECTION_IMAGE"),
            ("inspection_label", "string", 0, 4, ["ACCEPTABLE", "SURFACE_SCRATCH", "DIMENSIONAL_DEFECT", "POROSITY"], "LABEL"),
            ("station_id", "string", 0, 5, ["STATION_A", "STATION_B", "STATION_C", "STATION_D", "STATION_E"], "STATION"),
            ("batch_number", "string", 0, 20, ["BATCH-2026-01", "BATCH-2026-02"], "BATCH"),
            ("cycle_time_sec", "float", 0, 1180, [12.4, 18.2, 24.5], "CYCLE_TIME"),
            ("station_utilization_pct", "float", 0, 950, [75.5, 94.2, 88.0], "UTILIZATION"),
            ("downtime_minutes", "float", 5, 420, [0.0, 15.5, 45.0], "DOWNTIME"),
            ("wip_level", "int", 0, 85, [12, 48, 92], "WIP"),
            ("line_throughput_uph", "float", 0, 1100, [140.0, 185.5], "THROUGHPUT"),
            ("process_temp_celsius", "float", 2, 1190, [195.4, 212.8], "PROCESS_PARAM"),
            ("unit_scrap_cost", "float", 0, 50, [45.0, 60.0], "SCRAP_COST"),
            ("unit_rework_cost", "float", 0, 40, [15.0, 25.0], "REWORK_COST"),
            ("unit_revenue", "float", 0, 10, [250.0, 250.0], "REVENUE"),
            ("unit_margin", "float", 0, 500, [65.0, 85.0], "MARGIN")
        ]

        for col_name, dtype, missing, unique, samples, semantic_role in column_specs:
            db.add(DatasetColumn(
                dataset_id=dataset.id,
                column_name=col_name,
                data_type=dtype,
                missing_count=missing,
                unique_count=unique,
                sample_values=samples,
                semantic_role=semantic_role
            ))
        db.commit()

        # Seed Demo Inspection Predictions
        stations = ["STATION_A", "STATION_B", "STATION_C (CNC Stamping)", "STATION_D", "STATION_E"]
        batches = ["BATCH-2026-01", "BATCH-2026-02", "BATCH-2026-03", "BATCH-2026-04"]
        labels = ["ACCEPTABLE", "SURFACE_SCRATCH", "DIMENSIONAL_DEFECT", "POROSITY", "CRACK"]

        for i in range(1, 41):
            is_defect = random.random() < 0.22
            label = random.choice(labels[1:]) if is_defect else "ACCEPTABLE"
            station = "STATION_C (CNC Stamping)" if (is_defect and random.random() < 0.65) else random.choice(stations)
            conf = round(random.uniform(0.82, 0.98), 2)
            is_novel = True if (is_defect and random.random() < 0.10) else False

            boxes = []
            if is_defect:
                boxes.append({
                    "x": random.randint(50, 400),
                    "y": random.randint(50, 350),
                    "w": random.randint(40, 120),
                    "h": random.randint(40, 120),
                    "confidence": conf,
                    "label": label
                })

            db.add(InspectionPrediction(
                dataset_id=dataset.id,
                image_name=f"inspection_unit_{i:04d}.jpg",
                image_path=f"data/raw/demo_images/unit_{i:04d}.jpg",
                prediction=label,
                confidence=conf,
                uncertainty_level="HIGH" if is_novel else ("MEDIUM" if conf < 0.88 else "LOW"),
                is_novel=is_novel,
                bounding_boxes=boxes,
                ground_truth=label,
                station_id=station,
                batch_id=random.choice(batches),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
            ))
        db.commit()

        # Seed Demo Production Records across stations
        st_data = [
            ("STATION_A (Pre-Feeder)", 8.5, 72.0, 10.0, 15, 220.0),
            ("STATION_B (Thermal Press)", 14.2, 81.5, 25.0, 32, 190.0),
            ("STATION_C (CNC Stamping)", 26.8, 96.4, 115.0, 94, 115.0), # BOTTLENECK
            ("STATION_D (Surface Treatment)", 11.0, 68.0, 15.0, 22, 175.0),
            ("STATION_E (Final QA)", 9.2, 75.0, 5.0, 18, 210.0)
        ]

        for st_name, ct, util, dt, wip, tp in st_data:
            db.add(ProductionRecord(
                dataset_id=dataset.id,
                station_id=st_name,
                batch_id="BATCH-2026-ALL",
                cycle_time=ct,
                utilization_pct=util,
                downtime_minutes=dt,
                wip_count=wip,
                throughput=tp,
                process_param_value=212.5 if "CNC" in st_name else 180.0
            ))
        db.commit()

        # Seed Demo Economic Record
        db.add(EconomicRecord(
            dataset_id=dataset.id,
            unit_cost=165.0,
            scrap_cost=14250.0,
            rework_cost=6800.0,
            downtime_cost=21500.0,
            revenue=300000.0,
            margin=78450.0
        ))
        db.commit()

        # Seed Demo Recommendations
        rec1 = RecommendationItem(
            dataset_id=dataset.id,
            observation="Elevated defect rate (16.8%) observed primarily at Station C (CNC Stamping).",
            evidence="Statistical association detected (Pearson r = 0.74 between Cycle Time > 24s and Surface Scratch occurrence).",
            potential_association="High thermal expansion during prolonged cycle times may be associated with increased tool wear and surface scratching.",
            impact="Estimated monthly scrap loss of $14,250 and 115 minutes of station downtime.",
            suggested_action="Investigate tooling calibration at Station C and evaluate reducing cycle time from 26.8s to 20.0s.",
            simulation_result="Simulated line throughput increases by +22.6 UPH with estimated scrap cost reduction of $5,400/month.",
            confidence="HIGH",
            limitations="Statistical correlation does not strictly prove physical tool degradation; physical metallurgical verification recommended."
        )
        db.add(rec1)
        db.commit()
