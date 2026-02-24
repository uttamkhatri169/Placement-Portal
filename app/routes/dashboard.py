from fastapi import APIRouter
from app.config.supabase import supabase_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def stats():
    try:
        # Fetch counts manually to avoid reliance on 'placement_stats' view
        
        # 1. Total Students
        # Supabase-py < 2.0 uses count='exact', newer versions might differ but select(..., count='exact') works generally
        # We'll fetch just IDs to minimize payload if count param isn't handy in this client version without looking docs up deeply
        students_res = supabase_admin.table("users").select("id", count="exact").eq("role", "Student").execute()
        total_students = students_res.count if students_res.count is not None else len(students_res.data)

        # 2. Placed Students (Applications with status 'Selected')
        placed_res = supabase_admin.table("applications").select("id", count="exact").eq("status", "Selected").execute()
        placed_students = placed_res.count if placed_res.count is not None else len(placed_res.data)

        # 3. Placement Percentage
        placement_percentage = 0
        if total_students > 0:
            placement_percentage = round((placed_students / total_students) * 100, 2)
            
        # 4. Total Drives
        drives_res = supabase_admin.table("job_drives").select("id", count="exact").execute()
        total_drives = drives_res.count if drives_res.count is not None else len(drives_res.data)

        return {
            "total_students": total_students,
            "placed_students": placed_students,
            "placement_percentage": placement_percentage,
            "total_drives": total_drives
        }
    except Exception as e:
        print(f"Dashboard Stats Error: {e}")
        # Return zeros on error to prevent frontend crash
        return {
            "total_students": 0,
            "placed_students": 0,
            "placement_percentage": 0,
            "total_drives": 0
        }
