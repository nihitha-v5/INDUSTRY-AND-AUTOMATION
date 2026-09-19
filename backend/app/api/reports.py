import os
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.services.report_service import ReportService
from backend.app.core.config import settings

try:
    from xhtml2pdf import pisa
except ImportError:
    pisa = None

try:
    from htmldocx import HtmlToDocx
    import docx
except ImportError:
    HtmlToDocx = None

router = APIRouter(prefix="/api/reports", tags=["Report Generation"])

@router.get("/generate", response_class=HTMLResponse)
def generate_report(dataset_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    html_content = ReportService.generate_html_report(db, dataset_id)
    return HTMLResponse(content=html_content)

@router.get("/download")
def download_report(dataset_id: Optional[int] = Query(None), format: str = Query("html"), db: Session = Depends(get_db)):
    html_content = ReportService.generate_html_report(db, dataset_id)
    
    if format == "pdf":
        if not pisa:
            raise HTTPException(status_code=500, detail="PDF generation library not available")
        pdf_stream = io.BytesIO()
        pisa_status = pisa.CreatePDF(io.StringIO(html_content), dest=pdf_stream)
        if pisa_status.err:
            raise HTTPException(status_code=500, detail="Error generating PDF")
        pdf_stream.seek(0)
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=industrial_audit_report.pdf"}
        )
    
    elif format == "docx":
        if not HtmlToDocx:
            raise HTTPException(status_code=500, detail="DOCX generation library not available")
        doc = docx.Document()
        new_parser = HtmlToDocx()
        new_parser.add_html_to_document(html_content, doc)
        doc_stream = io.BytesIO()
        doc.save(doc_stream)
        doc_stream.seek(0)
        return StreamingResponse(
            doc_stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=industrial_audit_report.docx"}
        )
        
    else:
        # Default HTML
        file_path = os.path.join(settings.REPORT_DATA_PATH, "industrial_audit_report.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return FileResponse(file_path, media_type="text/html", filename="industrial_audit_report.html")
