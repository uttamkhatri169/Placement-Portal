from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user

router = APIRouter(prefix="/attendance", tags=["Attendance"])

class AttendanceCreate(BaseModel):
    internship_id: str
    week_number: int
    work_summary: str

@router.post("/")
def log_attendance(data: AttendanceCreate, user=Depends(get_current_user)):
    payload = data.dict()
    payload["student_id"] = user["id"]
    
    # Verify internship belongs to user or exists
    # (Optional validation step)
    
    res = supabase_admin.table("internship_attendance").insert(payload).execute()
    return res.data[0]

@router.get("/")
def get_attendance(user=Depends(get_current_user)):
    if user.get("role") in ["Admin", "Coordinator"]:
        res = supabase_admin.table("internship_attendance").select("*, users(full_name)").execute()
    else:
        res = supabase_admin.table("internship_attendance").select("*").eq("student_id", user["id"]).execute()
    return res.data
