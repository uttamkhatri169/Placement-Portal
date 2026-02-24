from fastapi import APIRouter, Depends, HTTPException
from app.schemas.models import PlacementProfileCreate, PlacementProfile
from app.config.supabase import supabase_admin
from app.utils.auth import get_current_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/me")
def get_my_profile(user=Depends(get_current_user)):
    # Use execute() without single() to avoid PGRST116 on no rows
    # Join with users to get department, full_name
    res = supabase_admin.table("placement_profiles").select("*, users(department, full_name)").eq("student_id", user["id"]).execute()
    if not res.data:
        return {}  
    return res.data[0]

@router.post("/") # Create or Update
def upsert_profile(data: PlacementProfileCreate, user=Depends(get_current_user)):
    # Check if exists
    existing = supabase_admin.table("placement_profiles").select("id").eq("student_id", user["id"]).execute()
    
    data_dict = data.dict(exclude={"full_name", "department"})
    data_dict["student_id"] = user["id"]
    
    # Update User Info if provided
    user_updates = {}
    if data.full_name:
        user_updates["full_name"] = data.full_name
    if data.department:
        user_updates["department"] = data.department
        
    if user_updates:
        try:
            supabase_admin.table("users").update(user_updates).eq("id", user["id"]).execute()
        except Exception as e:
            print(f"Failed to update user info: {e}")
    
    try:
        if existing.data:
            # Update
            res = supabase_admin.table("placement_profiles").update(data_dict).eq("student_id", user["id"]).execute()
        else:
            # Insert
            res = supabase_admin.table("placement_profiles").insert(data_dict).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
