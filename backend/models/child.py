from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class MissingChild(Document):
    child_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    gender: str = "unknown"
    last_seen_location: str
    last_seen_date: Optional[str] = None
    description: Optional[str] = None
    embedding_vector: List[float]
    case_status: str = "active"
    case_number: Optional[str] = None
    contact_info: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        collection = "missing_children"

class ChildRegisterRequest(BaseModel):
    name: str
    age: int
    gender: str = "unknown"
    last_seen_location: str
    last_seen_date: Optional[str] = None
    description: Optional[str] = None
    case_number: Optional[str] = None
    contact_info: Optional[str] = None

class MatchResult(BaseModel):
    child_id: str
    name: str
    age: int
    last_seen_location: str
    case_status: str
    confidence_score: float
    case_number: Optional[str] = None
    description: Optional[str] = None
