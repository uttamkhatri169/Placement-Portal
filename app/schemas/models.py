from pydantic import BaseModel, EmailStr, HttpUrl, AnyHttpUrl, field_validator
from typing import Optional, List, Union
from enum import Enum
from datetime import datetime, date
from uuid import UUID
import re

# Enums
class ApplicationStatus(str, Enum):
    Applied = 'Applied'
    Shortlisted = 'Shortlisted'
    Interviewing = 'Interviewing'
    Selected = 'Selected'
    Rejected = 'Rejected'

class PlacementRole(str, Enum):
    Student = 'Student'
    Coordinator = 'Coordinator'
    Admin = 'Admin'

class InternshipStatus(str, Enum):
    Pending = 'Pending'
    Approved = 'Approved'
    Rejected = 'Rejected'
    Completed = 'Completed'

# Base Models
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: PlacementRole = PlacementRole.Student
    department: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PlacementProfileBase(BaseModel):
    cgpa: Optional[float] = None
    backlogs: int = 0
    skills: List[str] = []
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    is_eligible: bool = True
    opted_out: bool = False

    @field_validator("linkedin_url")
    @classmethod
    def validate_linkedin(cls, v: Optional[str]):
        if v:
            if not v.startswith(("http://", "https://")):
                v = "https://" + v
            if "linkedin.com" not in v:
                raise ValueError("The LinkedIn URL must be a valid link from linkedin.com")
            # Basic pattern check for profile link
            if not re.search(r"linkedin\.com/(in|company|school)/[a-zA-Z0-9-_]+", v):
                 raise ValueError("The LinkedIn profile link format is invalid")
        return v

    @field_validator("github_url")
    @classmethod
    def validate_github(cls, v: Optional[str]):
        if v:
            if not v.startswith(("http://", "https://")):
                v = "https://" + v
            if "github.com" not in v:
                raise ValueError("The GitHub URL must be a valid link from github.com")
            # Basic pattern check for profile link
            if not re.search(r"github\.com/[a-zA-Z0-9-_]+", v):
                raise ValueError("The GitHub profile link format is invalid")
        return v


class PlacementProfileCreate(PlacementProfileBase):
    full_name: Optional[str] = None
    department: Optional[str] = None

class PlacementProfile(PlacementProfileBase):
    id: UUID
    student_id: UUID
    created_at: datetime

class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

    @field_validator("website")
    @classmethod
    def validate_website(cls, v: Optional[str]):
        if v:
            if not v.startswith(("http://", "https://")):
                v = "https://" + v
        return v

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: UUID
    created_at: datetime

class DriveBase(BaseModel):
    role: str
    package_lpa: Optional[float] = None
    eligibility_cgpa: Optional[float] = None
    allowed_backlogs: int = 0
    drive_date: Optional[date] = None
    application_deadline: Optional[date] = None
    description: Optional[str] = None

class DriveCreate(DriveBase):
    company_id: UUID

class Drive(DriveBase):
    id: UUID
    company_id: UUID
    created_by: Optional[UUID]
    created_at: datetime

class ApplicationBase(BaseModel):
    drive_id: UUID

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: UUID
    student_id: UUID
    status: ApplicationStatus
    current_round: Optional[str]
    applied_at: datetime
    updated_at: datetime

class InternshipRequestBase(BaseModel):
    company_name: Optional[str] = None
    duration_months: Optional[int] = None
    requires_recommendation: bool = False
    supervisor_name: Optional[str] = None
    remarks: Optional[str] = None

class InternshipRequestCreate(InternshipRequestBase):
    pass

class InternshipRequest(InternshipRequestBase):
    id: UUID
    student_id: UUID
    status: InternshipStatus
    created_at: datetime


class StudentDocumentType(str, Enum):
    CV = 'CV'
    CoverLetter = 'CoverLetter'
    Photo = 'Photo'
    GovtId = 'GovtId'
    Other = 'Other'

class StudentDocumentBase(BaseModel):
    title: str
    document_type: StudentDocumentType

class StudentDocumentCreate(StudentDocumentBase):
    pass

class StudentDocument(StudentDocumentBase):
    id: UUID
    student_id: UUID
    file_url: str
    created_at: datetime

    @field_validator("file_url")
    @classmethod
    def validate_file_url(cls, v: str):
        if not v.startswith("/uploads/") and not v.startswith(("http://", "https://")):
             raise ValueError("Must be a valid local path or remote URL")
        return v
