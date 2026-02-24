from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config.supabase import supabase_admin

router = APIRouter(prefix="/auth", tags=["Auth"])

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "Student"
    department: str = None

@router.post("/signup")
def register_user(data: UserRegister):
    try:
        # Use Admin API to create user with auto-confirmation
        # Note: 'email_confirm' param might depend on library version, 
        # but create_user usually auto-confirms if using service_role or we can update it.
        
        # 1. Create User in Supabase Auth
        user_response = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True, # Auto confirm
            "user_metadata": {
                "full_name": data.full_name,
                "role": data.role,
                "department": data.department
            }
        })
        
        user = user_response.user
        
        # 2. Sync with public.users (Our trigger logic in utils/auth.py handles this on login, 
        # but let's do it here to be safe and immediate)
        
        new_user = {
            "id": user.id,
            "email": user.email,
            "full_name": data.full_name,
            "role": data.role,
            "department": data.department
        }
        
        supabase_admin.table("users").insert(new_user).execute()
        
        return {"message": "User created successfully. You can now login.", "user_id": user.id}

    except Exception as e:
        print(f"Registration Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
