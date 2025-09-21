from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    username: str
    password: str = Field(..., min_length=8)
    role: str = "user"

class User(BaseModel):
    id: UUID
    username: str
    role: str
    
    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    role: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

class UserInDB(User):
    hashed_password: str