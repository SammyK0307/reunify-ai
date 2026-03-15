from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Security
from services.ai_pipeline import ai_pipeline
from services.faiss_service import faiss_service
from services.auth_service import verify_token, require_admin
from models.child import MissingChild, ChildRegisterRequest
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register-child")
async def register_child(
    file: UploadFile = File(...),
    name: str = Form(...),
    age: int = Form(...),
    gender: str = Form("unknown"),
    last_seen_location: str = Form(...),
    last_seen_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    case_number: Optional[str] = Form(None),
    contact_info: Optional[str] = Form(None),
    payload: dict = Security(require_admin),
):
    image_bytes = await file.read()
    embedding, status = await ai_pipeline.process_image(image_bytes)
    del image_bytes

    if embedding is None:
        raise HTTPException(status_code=422, detail=f"Face not detected: {status}")

    child = MissingChild(
        name=name, age=age, gender=gender,
        last_seen_location=last_seen_location,
        last_seen_date=last_seen_date,
        description=description,
        case_number=case_number,
        contact_info=contact_info,
        embedding_vector=embedding.tolist(),
    )
    await child.insert()
    faiss_service.add_embedding(child.child_id, embedding)

    return {
        "success": True,
        "child_id": child.child_id,
        "message": f"Child {name} registered successfully",
        "privacy_note": "Reference image was not stored."
    }


@router.get("/children")
async def list_children(payload: dict = Security(verify_token)):
    children = await MissingChild.find_all().to_list()
    return [{
        "child_id": c.child_id, "name": c.name, "age": c.age,
        "gender": c.gender, "last_seen_location": c.last_seen_location,
        "last_seen_date": c.last_seen_date, "case_status": c.case_status,
        "case_number": c.case_number, "created_at": c.created_at.isoformat()
    } for c in children]


@router.patch("/children/{child_id}/status")
async def update_status(child_id: str, status: str, payload: dict = Security(require_admin)):
    if status not in ("active", "found", "closed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    child = await MissingChild.find_one(MissingChild.child_id == child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    child.case_status = status
    await child.save()
    if status != "active":
        await faiss_service.rebuild_index()
    return {"success": True, "child_id": child_id, "new_status": status}
