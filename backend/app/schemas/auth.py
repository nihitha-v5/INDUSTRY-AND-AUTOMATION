from pydantic import BaseModel
from typing import Optional
from backend.app.database.models import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    email: str
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: Optional[UserRole] = UserRole.ANALYST

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
