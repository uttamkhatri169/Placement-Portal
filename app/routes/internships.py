from fastapi import APIRouter, Depends, HTTPException
from app.schemas.models import InternshipRequestCreate, InternshipStatus
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user

router = APIRouter(prefix="/internships", tags=["Internships"])

@router.post("/")
def create_request(data: InternshipRequestCreate, user=Depends(get_current_user)):
    # Students only
    # Add check if needed
    
    payload = data.dict()
    payload["student_id"] = user["id"]
    print(f"DEBUG: Creating Internship Request. Payload: {payload}")
    
    try:
        res = supabase_admin.table("internship_requests").insert(payload).execute()
        print(f"DEBUG: Internship Request response: {res.data}")
        return res.data[0]
    except Exception as e:
        print(f"DEBUG: Internship Request Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
def get_requests(user=Depends(get_current_user)):
    # If admin/coordinator, show all. If student, show own.
    # For now, simplistic check:
    if user.get("role") in ["Admin", "Coordinator"]:
         res = supabase_admin.table("internship_requests").select("*, users(full_name, email)").execute()
    else:
         res = supabase_admin.table("internship_requests").select("*").eq("student_id", user["id"]).execute()
         
    return res.data

@router.put("/{request_id}/status")
def update_status(request_id: str, status: InternshipStatus, user=Depends(get_current_user)):
    if user.get("role") not in ["Admin", "Coordinator"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    res = supabase_admin.table("internship_requests").update({"status": status}).eq("id", request_id).execute()
    return res.data
