from fastapi import APIRouter, Depends, HTTPException
from app.schemas.models import CompanyCreate, Company
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.post("/", response_model=Company)
def create_company(data: CompanyCreate, user=Depends(get_current_user)):
    if user.get("role") not in ["Coordinator", "Admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    res = supabase_admin.table("companies").insert(data.dict()).execute()
    return res.data[0]

@router.get("")
def get_companies(user=Depends(get_current_user)):
    res = supabase_admin.table("companies").select("*").execute()
    return res.data
