from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from app.config.settings import settings

from app.routes import drives, applications, internships, dashboard, companies, profiles, documents, auth, attendance, benefits

app = FastAPI(title="UMS Placement Portal")

# Include APIs
app.include_router(drives.router)
app.include_router(applications.router)
app.include_router(internships.router)
app.include_router(dashboard.router)
app.include_router(companies.router)
app.include_router(profiles.router)
app.include_router(documents.router)
app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(benefits.router)

# Static Files
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/uploads", StaticFiles(directory="app/static/uploads"), name="uploads")

# Templates
templates = Jinja2Templates(directory="app/templates")

# Frontend route
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "settings": settings})
