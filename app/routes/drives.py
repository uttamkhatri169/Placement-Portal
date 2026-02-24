from fastapi import APIRouter, Depends, HTTPException
from app.schemas.models import DriveCreate, Drive
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/drives", tags=["Drives"])

@router.post("/", response_model=Drive) # Response model might need adjustment as supabase returns dict
def create_drive(data: DriveCreate, user=Depends(get_current_user)):
    # Only Coordinators or Admins can create drives
    if user.get("role") not in ["Coordinator", "Admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    drive_data = data.dict()
    drive_data["created_by"] = user["id"]
    
    # Convert dates to string if needed by Supabase client, usually it handles date objects fine
    if drive_data.get("drive_date"):
        drive_data["drive_date"] = str(drive_data["drive_date"])
    if drive_data.get("application_deadline"):
        drive_data["application_deadline"] = str(drive_data["application_deadline"])

    response = supabase_admin.table("job_drives").insert(drive_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create drive")

    return response.data[0]

@router.get("")
def get_drives(user=Depends(get_current_user)):
    # Fetch all drives with company details
    response = supabase_admin.table("job_drives").select("*, companies(name, location)").execute()
    return response.data

@router.get("/{drive_id}")
def get_drive_details(drive_id: str, user=Depends(get_current_user)):
    response = supabase_admin.table("job_drives").select("*, companies(*)").eq("id", drive_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Drive not found")
    return response.data[0]
