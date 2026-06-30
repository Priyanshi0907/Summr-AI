from fastapi import APIRouter, UploadFile, File, HTTPException
import io
router = APIRouter()

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ["application/pdf", "text/plain", "text/markdown"]:
        raise HTTPException(400, "Unsupported file type. Use PDF or TXT.")
    content = await file.read()
    if file.content_type == "text/plain":
        return {"text": content.decode("utf-8", errors="ignore"), "filename": file.filename}
    return {"text": f"[PDF parsing requires PyMuPDF - {len(content)} bytes received]", "filename": file.filename}
