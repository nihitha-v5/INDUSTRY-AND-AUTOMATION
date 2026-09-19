# VISUAL INSPECTION & DEFECT ROOT-CAUSE ASSISTANT

**Hackathon:** NeuraX Hackathon 3.0  
**Domain:** Domain 2 – AI in Industry and Automation  

---

## Evaluation Alignment Summary
- **Problem Understanding (5 Marks):** Fully frames manufacturing as an integrated decision problem linking product visual quality, process conditions, line bottlenecks, and financial economics rather than an isolated image labeler.
- **Architecture (5 Marks):** Features a software-only, modular, full-stack architecture (React/Vite/TS frontend + FastAPI/Python/SQLAlchemy backend + SQLite/PostgreSQL-compatible DB + computer vision model adapters + analytical engines).
- **Approach (5 Marks):** Incorporates dynamic schema profiling, interactive column mapping, data quality validation, novelty/uncertainty detection, statistical process correlation, what-if bottleneck simulation, evidence-based recommendation generation, demo mode out-of-the-box, and executive audit report exports.

---

# 1. Problem Statement

High-throughput manufacturing environments must maintain product quality while meeting strict production and economic targets. Defects can be difficult to detect at production speed, while bottlenecks, high cycle time, downtime, WIP accumulation, scrap, and rework can reduce throughput and increase operational costs.

A simple image classifier can identify a defect, but it cannot explain how the defect relates to process conditions, whether a station constrains line throughput, or what the financial economic impact is.

The **Visual Inspection & Defect Root-Cause Assistant** is an integrated software-only AI industrial decision-support system that connects **Inspection Data**, **Production/Process Data**, and **Economic Data**.

---

# 2. Problem Understanding

The system treats manufacturing as a connected decision problem:

```text
Product Visual Quality
          ↓
  Defect Analysis
          ↓
Process / Production Correlation
          ↓
Bottleneck & Throughput Analysis
          ↓
Cost / Economic Impact
          ↓
  What-If Simulation
          ↓
Advisory Recommendation
```

The system provides answers to critical operational questions:
- Is the unit acceptable or defective?
- What defect category is supported by the data?
- Where is the defect located (bounding boxes, masks, heatmaps) when localization data exists?
- How confident is the AI prediction, and is the sample uncertain or novel?
- Are defects associated with specific stations, batches, or process parameters?
- Where is the primary production bottleneck constraining output?
- What is the estimated financial scrap, rework, downtime loss, and margin impact?
- What line throughput improvements occur under a simulated bottleneck improvement?

---

# 3. Proposed Solution

The system implements the following end-to-end flow:

```text
Inspection + Production + Economic Data (Uploaded or Demo)
                    ↓
     Dynamic Schema Profiling & Column Mapping
                    ↓
       Data Quality Validation & Preprocessing
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
 Defect Analysis        Production Analysis
(CV Model Adapters)     (Capacity/Cycle/WIP)
        └───────────┬───────────┘
                    ↓
     Root-Cause / Statistical Correlation
                    ↓
           Bottleneck Analysis
                    ↓
            Economic Analysis
                    ↓
          What-If Simulation Engine
                    ↓
      Advisory Recommendation Engine
                    ↓
    14-Page Interactive Web Dashboard & Audit Report
```

---

# 4. Key Objectives

- Detect acceptable and defective units without assuming dataset schemas beforehand.
- Support defect classification, detection (bounding boxes), and segmentation (mask contours) via modular model adapters.
- Provide model confidence percentages and novelty/uncertainty detection for out-of-distribution samples.
- Evaluate False Accept and False Reject trade-offs across confidence thresholds.
- Correlate inspection findings with station parameters, cycle times, utilization, WIP, and downtime.
- Identify primary line bottlenecks using multi-indicator capacity analysis.
- Estimate financial scrap, rework, downtime loss, production loss, revenue, and profit margin.
- Run interactive What-If simulations for hypothetical station parameter improvements.
- Generate evidence-based advisory recommendations with explicit limitations.

---

# 5. System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT + VITE + TS FRONTEND                      │
│ 14 Pages | Tailwind CSS | Recharts | Glassmorphism | Role-Based UI     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Axios REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FASTAPI PYTHON BACKEND                         │
│ Authentication (JWT) | Schema Profiling | Column Mapping | Quality Check│
├────────────────────────────────────────────────────────────────────────┤
│                      MODULAR AI / ML / CV LAYER                        │
│ BaseModelAdapter -> Classification / Detection / Segmentation Adapters │
│ NoveltyDetector (IsolationForest / OpenCV entropy)                     │
├────────────────────────────────────────────────────────────────────────┤
│                          ANALYTICAL ENGINES                            │
│ RootCause (Pearson/ANOVA) | Bottleneck (Capacity) | Economics | Sim    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy ORM
┌───────────────────────────────────▼────────────────────────────────────┐
│                    SQLITE / POSTGRESQL-COMPATIBLE DB                   │
│ Users | Datasets | DatasetColumns | Models | Predictions | Records     │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 6. End-to-End Workflow

1. **Upload / Demo:** Receive tabular data (CSV, XLSX, JSON) and inspection images or activate pre-loaded Demo Mode.
2. **Schema Profiling:** Automatically profile rows, columns, data types, missing values, and unique counts.
3. **Column Mapping:** Map detected column names to semantic roles (`INSPECTION_IMAGE`, `LABEL`, `DEFECT_CLASS`, `STATION`, `CYCLE_TIME`, `UTILIZATION`, `DOWNTIME`, `WIP`, `THROUGHPUT`, `SCRAP_COST`, `REWORK_COST`, etc.).
4. **Data Validation:** Execute Data Quality Engine to check missing values, duplicates, outliers, and missing images.
5. **Computer Vision Inference:** Pass images to active model adapter (PyTorch, TensorFlow, YOLO, ONNX, scikit-learn).
6. **Defect & Novelty Analysis:** Calculate confidence, bounding boxes, and novelty warning flags.
7. **Production Analysis:** Compute cycle time, utilization %, WIP queue accumulation, and downtime.
8. **Root-Cause Correlation:** Run statistical correlation (Pearson r) and feature importance ranking.
9. **Bottleneck Analysis:** Isolate primary line bottleneck stations.
10. **Economic Analysis:** Aggregate scrap costs, rework exposure, downtime losses, revenue, and margin.
11. **What-If Simulation:** Interactively adjust station parameters and evaluate baseline vs simulated output.
12. **Recommendation Engine:** Synthesize findings into structured advisory cards.
13. **Dashboard & Report Export:** Present results in 14-page Web Dashboard and export printable HTML audit report.

---

# 7. Defect Detection and Localization

- **Classification:** Categorizes acceptable vs defective units and specific defect classes.
- **Localization:** Draws bounding boxes or mask contours when supported by uploaded detection/segmentation models. When localization is unavailable, displays `"Localization is not available for this model/dataset."` without fabricating fake boxes.
- **Confidence & Novelty:** Highlights model confidence percentages and flags out-of-distribution samples as `"Potentially novel / uncertain sample"`.
- **False Accept / False Reject:** Interactive confusion matrix and threshold slider evaluating the operational trade-off between customer defect escapes (False Accept) and unnecessary scrap/rework (False Reject).

---

# 8. Root-Cause Analysis

Connects inspection results with process data. Reports **potential process associations** (e.g. `"Observed correlation between Station C cycle time > 24s and defect rate"`) rather than unproven causal statements.

---

# 9. Bottleneck Detection

Analyzes station capacity, cycle time, utilization %, WIP queue levels, downtime minutes, and line throughput (UPH) to isolate the primary constraint station.

---

# 10. Cost and Profitability Analysis

Estimates Scrap Cost, Rework Cost, Downtime Loss, Production Loss, Revenue, and Margin based on mapped dataset fields. Outputs `"Not available in uploaded dataset"` if fields are unmapped.

---

# 11. What-If Simulation

Interactively evaluates hypothetical station cycle time adjustments or downtime reductions, comparing baseline vs simulated throughput and cost savings. All results carry explicit advisory disclaimers.

---

# 12. Recommendation Engine

Synthesizes evidence into structured decision-support cards containing:
`OBSERATION`, `EVIDENCE`, `POTENTIAL PROCESS ASSOCIATION`, `IMPACT`, `SUGGESTED ACTION`, `SIMULATION RESULT`, `CONFIDENCE`, and `LIMITATIONS`.

---

# 13. Dashboard Pages (14 Complete Views)

1. `/login` - Authentication & Quick Role Selector
2. `/register` - Role-Based User Registration
3. `/overview` - Executive Overview Dashboard (16 KPI cards + charts)
4. `/data-management` - File Upload, Profiling, Column Mapper & Data Quality Report
5. `/visual-inspection` - Live Computer Vision Inspection & Localization Canvas
6. `/root-cause` - Process Correlation Matrix & Feature Importance
7. `/production-flow` - Sequential Line Diagram & Station Charts
8. `/bottlenecks` - Bottleneck Matrix & Constraint Rank List
9. `/economics` - Financial Cost Breakdown & Margin Summary
10. `/simulation` - Interactive Parameter Sliders & Baseline vs Simulated Comparison
11. `/recommendations` - Executive Advisory Cards & Report Export
12. `/models` - Model Weight Upload, Framework Selection & Activation
13. `/model-performance` - Confusion Matrix & False Accept/Reject Sliders
14. `/settings` - Threshold Controls & Analytical Engine Toggles

---

# 14. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Axios, Lucide Icons, React Router DOM.
- **Backend:** Python 3.10+, FastAPI, Pydantic, SQLAlchemy ORM, Uvicorn, Passlib (bcrypt), PyJWT.
- **Data & CV:** Pandas, NumPy, OpenCV (`opencv-python`), Scikit-Learn, OpenPyXL, Pillow.
- **Database:** SQLite (local development) / PostgreSQL-compatible architecture.

---

# 15. Project Structure

```text
visual-inspection-root-cause-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/ (config.py, security.py)
│   │   ├── database/ (session.py, models.py)
│   │   ├── schemas/ (auth, dataset, model, inspection, analytics, simulation, recommendation)
│   │   ├── api/ (auth, datasets, models, inspection, analytics, simulation, recommendations, dashboard, reports)
│   │   ├── services/ (dataset_service, column_mapping_service, data_quality_service, root_cause_service, bottleneck_service, economic_service, simulation_service, recommendation_service, demo_service, report_service)
│   │   └── ml/ (base_adapter, classification_adapter, detection_adapter, segmentation_adapter, novelty_detector)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ (layouts/Sidebar.tsx, Navbar.tsx, common/MetricCard.tsx)
│   │   ├── context/ (AuthContext.tsx, DataContext.tsx)
│   │   ├── api/ (client.ts, auth.ts, datasets.ts, inspection.ts, analytics.ts, simulation.ts, recommendations.ts, models.ts)
│   │   ├── pages/ (14 Complete Page Views)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── data/ (raw, processed, uploads, reports)
├── models/ (uploaded, active, metadata)
├── .env
├── .env.example
├── .gitignore
└── README.md
```

---

# 16. Installation

### Backend Setup (Python Virtual Environment)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate

# Install dependencies:
pip install -r requirements.txt
```

### Frontend Setup (Node.js / npm)
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies:
npm install
```

---

# 17. Running the Application

### 1. Launch FastAPI Backend Server
```bash
# From workspace root with activated .venv
uvicorn backend.app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 2. Launch Vite React Frontend
```bash
# In a new terminal window
cd frontend
npm run dev
```
Open web application in browser at: `http://localhost:5173`

---

# 18. Dataset & Dynamic Adaptation

Out of the box, the application runs in **Demo Mode** ("DEMO DATA – NOT ORGANIZER DATA") with pre-seeded multi-stage industrial dataset and pre-trained computer vision model weights.

When organizer datasets and model weights are uploaded:
1. The system dynamically profiles schema columns.
2. The user maps columns via interactive Column Mapping UI.
3. The application switches to actual-data mode.
4. Missing metrics show `"Not available in uploaded dataset"` without fabricating false values.

---

# 19. Evaluation Alignment

- **Problem Understanding (5 Marks):** Integrated industrial decision support framing.
- **Architecture (5 Marks):** Modular, scalable full-stack software architecture with adapter pattern.
- **Approach (5 Marks):** Rigorous data quality checking, correlation analysis, and evidence-based recommendation generation.

---

# 20. Limitations

- Correlations indicate statistical association, not guaranteed physical causation.
- Visual defect localization requires suitable uploaded annotation model weights.
- Economic values depend on completeness of uploaded financial dataset parameters.
- What-If simulations are hypothetical advisory estimates and do not directly control real machines.

---

# 21. Future Improvements

- Integration with industrial IoT protocols (MQTT, OPC-UA) for real-time PLC telemetry streaming.
- Automated hyperparameter tuning and model retraining pipeline.
- Expanded 3D defect mesh rendering for advanced CAD inspection.

---

# 22. Team

| Role | Team Member |
|---|---|
| **Team Lead** | `Durga Bhavani` |
| **AI / ML** | `Mahesh` |
| **Computer Vision** | `Nihitha` |
| **Data / Analytics** | `Anil` |
| **Full-Stack / Dashboard** | `Mahesh` |
| **Research / Documentation** | `Anil` |
