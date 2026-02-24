from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user

router = APIRouter(prefix="/benefits", tags=["Benefits"])

class BenefitRequestCreate(BaseModel):
    benefit_type: str
    reason: str

@router.post("/")
def request_benefit(data: BenefitRequestCreate, user=Depends(get_current_user)):
    payload = data.dict()
    payload["student_id"] = user["id"]
    
    res = supabase_admin.table("academic_benefit_requests").insert(payload).execute()
    return res.data[0]

@router.get("/")
def get_benefits(user=Depends(get_current_user)):
    if user.get("role") in ["Admin", "Coordinator"]:
        res = supabase_admin.table("academic_benefit_requests").select("*, users(full_name)").execute()
    else:
        res = supabase_admin.table("academic_benefit_requests").select("*").eq("student_id", user["id"]).execute()
    return res.data
