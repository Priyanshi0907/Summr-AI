from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import io

from app.schemas.schemas import SummaryOutput
from app.utils.export_utils import export_as_txt, export_as_markdown, export_as_pdf, export_as_docx

router = APIRouter()

class ExportRequest(BaseModel):
    title: Optional[str] = "SummrAI Summary"
    format: str = "pdf"  # pdf | docx | md | txt
    data: SummaryOutput

@router.post("")
async def export_summary(request: ExportRequest):
    """
    Export the summary data in the requested format.
    Generates a download stream.
    """
    try:
        # Convert Pydantic SummaryOutput model to dictionary
        summary_data = request.data.model_dump() if hasattr(request.data, "model_dump") else request.data.dict()
        summary_data["title"] = request.title
        
        fmt = request.format.lower()
        if fmt == "pdf":
            content = export_as_pdf(summary_data)
            media_type = "application/pdf"
            filename_ext = "pdf"
        elif fmt == "docx":
            content = export_as_docx(summary_data)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename_ext = "docx"
        elif fmt == "md":
            content = export_as_markdown(summary_data)
            media_type = "text/markdown"
            filename_ext = "md"
        elif fmt == "txt":
            content = export_as_txt(summary_data)
            media_type = "text/plain"
            filename_ext = "txt"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")
            
        return StreamingResponse(
            io.BytesIO(content),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename=summary.{filename_ext}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
