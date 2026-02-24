from fastapi import APIRouter, Depends, HTTPException
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user
from app.schemas.models import ApplicationCreate, ApplicationStatus

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/{drive_id}")
def apply(drive_id: str, user=Depends(get_current_user)):
    student_id = user["id"]
    
    # Check if already applied
    existing = supabase_admin.table("applications").select("id").eq("student_id", student_id).eq("drive_id", drive_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already applied to this drive")

    # Check eligibility (Profile)
    # Use execute() instead of single()
    profile_res = supabase_admin.table("placement_profiles").select("*").eq("student_id", student_id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=400, detail="Placement profile not found. Please complete your profile first.")
    
    profile_data = profile_res.data[0]
    
    if not profile_data.get("is_eligible"):
        raise HTTPException(status_code=400, detail="You are not eligible for placements.")
        
    # Check eligibility (Drive Criteria)
    drive_res = supabase_admin.table("job_drives").select("*").eq("id", drive_id).execute()
    if not drive_res.data:
        raise HTTPException(status_code=404, detail="Drive not found")
    
    drive_data = drive_res.data[0]
        
    # Basic Check: CGPA
    if drive_data.get("eligibility_cgpa") and (profile_data.get("cgpa") or 0) < drive_data.get("eligibility_cgpa"):
         raise HTTPException(status_code=400, detail=f"CGPA mismatch. Required: {drive_data['eligibility_cgpa']}")

    # Apply
    res = supabase_admin.table("applications").insert({
        "student_id": student_id,
        "drive_id": drive_id,
        "status": ApplicationStatus.Applied
    }).execute()
    
    return res.data[0]

@router.get("/me")
def my_apps(user=Depends(get_current_user)):
    # join with job_drives and companies to show full details
    # Supabase syntax for foreign key join: job_drives(..., companies(...))
    res = supabase_admin.table("applications") \
        .select("*, job_drives(role, package_lpa, companies(name))") \
        .eq("student_id", user["id"]) \
        .execute()
    return res.data
