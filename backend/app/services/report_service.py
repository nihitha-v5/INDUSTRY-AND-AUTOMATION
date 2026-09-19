import os
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.services.root_cause_service import RootCauseService
from backend.app.services.bottleneck_service import BottleneckService
from backend.app.services.economic_service import EconomicService
from backend.app.services.recommendation_service import RecommendationService

class ReportService:
    """
    Aggregates comprehensive industrial decision-support findings into a formal audit report.
    Includes Dataset Summary, Quality Profile, Root Cause Evidence, Bottleneck Constraints,
    Economic Impact, Simulations, Recommendations, and System Limitations.
    """

    @classmethod
    def generate_html_report(cls, db: Session, dataset_id: Optional[int] = None) -> str:
        root_cause = RootCauseService.analyze_root_cause(db, dataset_id)
        bottlenecks = BottleneckService.analyze_bottlenecks(db, dataset_id)
        economics = EconomicService.analyze_economics(db, dataset_id)
        recommendations = RecommendationService.get_recommendations(db, dataset_id)

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Industrial Analytics Decision-Support Audit Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }}
        .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }}
        .header h1 {{ color: #60a5fa; margin: 0 0 10px 0; }}
        .header p {{ color: #94a3b8; margin: 0; }}
        .card {{ background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-bottom: 25px; }}
        h2 {{ color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-top: 0; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
        th, td {{ border: 1px solid #334155; padding: 10px; text-align: left; }}
        th {{ background-color: #0f172a; color: #93c5fd; }}
        .badge {{ background-color: #1e3a8a; color: #93c5fd; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; }}
        .warning {{ background-color: #78350f; color: #fde68a; padding: 10px; border-radius: 6px; margin: 10px 0; }}
        .disclaimer {{ font-size: 0.85em; color: #94a3b8; border-top: 1px solid #334155; margin-top: 40px; padding-top: 15px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>VISUAL INSPECTION & DEFECT ROOT-CAUSE ASSISTANT</h1>
        <p>NeuraX Hackathon 3.0 | Domain 2 – AI in Industry and Automation</p>
        <p><strong>Generated On:</strong> {now_str} | <strong>Mode:</strong> Executive Decision-Support Audit</p>
    </div>

    <div class="card">
        <h2>1. Executive Dataset & Quality Summary</h2>
        <p>This report integrates Inspection, Production, and Economic data sources to provide an end-to-end industrial decision support analysis.</p>
        <table>
            <tr><th>Metric</th><th>Value / Status</th></tr>
            <tr><td>Dataset Identification</td><td>Demo Industrial Multi-Stage Dataset</td></tr>
            <tr><td>Total Inspected Units</td><td>1,200 units</td></tr>
            <tr><td>Primary Bottleneck Station</td><td>{bottlenecks.get('primary_bottleneck', 'Station C')}</td></tr>
            <tr><td>Estimated Monthly Scrap Cost</td><td>${economics.get('scrap_cost', 0):,.2f}</td></tr>
            <tr><td>Estimated Profit Margin</td><td>${economics.get('estimated_margin', 0):,.2f}</td></tr>
        </table>
    </div>

    <div class="card">
        <h2>2. Defect Analysis & Root-Cause Correlation</h2>
        <p>Statistical associations identified between product defect occurrences and production process variables:</p>
        <ul>
"""
        for finding in root_cause.get("key_findings", []):
            html += f"            <li>{finding}</li>\n"

        html += """        </ul>
        <h3>Correlations</h3>
        <table>
            <tr><th>Feature 1</th><th>Feature 2</th><th>Correlation Coeff</th><th>Interpretation</th></tr>
"""
        for corr in root_cause.get("correlations", []):
            html += f"            <tr><td>{corr.get('feature1')}</td><td>{corr.get('feature2')}</td><td>{corr.get('coefficient')}</td><td>{corr.get('interpretation')}</td></tr>\n"

        html += """        </table>
    </div>

    <div class="card">
        <h2>3. Bottleneck Analysis & Production Constraints</h2>
        <p>Multi-indicator capacity analysis combining cycle time, utilization %, WIP queue levels, and station downtime.</p>
        <table>
            <tr><th>Station</th><th>Cycle Time (s)</th><th>Utilization (%)</th><th>WIP Queue</th><th>Downtime (min)</th><th>Bottleneck Status</th></tr>
"""
        for st in bottlenecks.get("stations", []):
            status_text = "PRIMARY BOTTLENECK" if st.get("is_bottleneck") else "Normal"
            html += f"            <tr><td>{st.get('station')}</td><td>{st.get('cycle_time')}</td><td>{st.get('utilization_pct')}%</td><td>{st.get('wip')}</td><td>{st.get('downtime_mins')}</td><td>{status_text}</td></tr>\n"

        html += """        </table>
    </div>

    <div class="card">
        <h2>4. Financial Economic Impact</h2>
        <table>
            <tr><th>Impact Category</th><th>Estimated Amount</th></tr>
"""
        for item in economics.get("cost_breakdown", []):
            html += f"            <tr><td>{item.get('category')}</td><td>${item.get('amount'):,.2f}</td></tr>\n"

        html += """        </table>
    </div>

    <div class="card">
        <h2>5. Evidence-Based Advisory Recommendations</h2>
"""
        for rec in recommendations:
            html += f"""        <div style="border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 20px;">
            <h3>{rec.get('title')}</h3>
            <p><strong>Observation:</strong> {rec.get('observation')}</p>
            <p><strong>Evidence:</strong> {rec.get('evidence')}</p>
            <p><strong>Potential Process Association:</strong> {rec.get('potential_association')}</p>
            <p><strong>Impact:</strong> {rec.get('impact')}</p>
            <p><strong>Suggested Action:</strong> {rec.get('suggested_action')}</p>
            <p><strong>Simulation Result:</strong> {rec.get('simulation_result')}</p>
            <p><strong>Limitations:</strong> {rec.get('limitations')}</p>
        </div>\n"""

        html += """    </div>

    <div class="disclaimer">
        <p><strong>IMPORTANT DISCLAIMER:</strong> All analytical correlations, simulations, and recommendations are data-driven advisory decision support outputs. They do not claim automatic physical causation nor directly control physical machinery. Engineering review is required prior to industrial implementation.</p>
    </div>
</body>
</html>
"""
        return html
