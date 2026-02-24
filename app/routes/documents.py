from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user
from pydantic import BaseModel, field_validator
from typing import List
import shutil
import os
from pathlib import Path
from app.schemas.models import StudentDocument, StudentDocumentType

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("app/static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class DocumentCreate(BaseModel):
    title: str
    file_url: str
    category: str
    is_public: bool = True

    @field_validator("file_url")
    @classmethod
    def validate_file_url(cls, v: str):
        if not v.startswith("/uploads/") and not v.startswith(("http://", "https://")):
             raise ValueError("Must be a valid local path or remote URL")
        return v

@router.post("/")
def upload_document(data: DocumentCreate, user=Depends(get_current_user)):
    if user.get("role") not in ["Admin", "Coordinator"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    payload = data.dict()
    payload["uploaded_by"] = user["id"]
    
    res = supabase_admin.table("placement_documents").insert(payload).execute()
    return res.data[0]

@router.get("")
def get_documents(user=Depends(get_current_user)):
    # Everyone can see public docs
    res = supabase_admin.table("placement_documents").select("*").execute()
    return res.data

# Student Document Endpoints

@router.post("/upload", response_model=StudentDocument)
async def upload_student_document(
    title: str = Form(...),
    document_type: StudentDocumentType = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    # Security: Ensure file is safe? For now, trusting extension
    # Save file
    safe_filename = f"{user['id']}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/uploads/{safe_filename}"
    
    # Save to DB
    payload = {
        "student_id": user["id"],
        "title": title,
        "document_type": document_type.value,
        "file_url": file_url
    }
    
    try:
        res = supabase_admin.table("student_documents").insert(payload).execute()
        return res.data[0]
    except Exception as e:
        # Cleanup file if DB fails
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my", response_model=List[StudentDocument])
def get_my_documents(user=Depends(get_current_user)):
    res = supabase_admin.table("student_documents").select("*").eq("student_id", user["id"]).execute()
    return res.data
