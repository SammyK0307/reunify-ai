"""
POST /upload – Accepts image, extracts embedding, returns matches.
Image is NEVER stored. Only embedding is used for search.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Security
from services.ai_pipeline import ai_pipeline
from services.faiss_service import faiss_service
from services.auth_service import verify_token
from models.child import MissingChild, MatchResult
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_SIZE_MB = 10


@router.post("/upload", response_model=dict)
async def upload_and_search(
    file: UploadFile = File(...),
    payload: dict = Security(verify_token)
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    image_bytes = await file.read()

    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_SIZE_MB}MB)")

    # AI Pipeline: image → embedding (image bytes discarded inside pipeline)
    embedding, status = await ai_pipeline.process_image(image_bytes)
    del image_bytes  # Explicit privacy-safe deletion

    if embedding is None:
        raise HTTPException(status_code=422, detail=status)

    # FAISS similarity search
    matches_raw = faiss_service.search(embedding, top_k=3)

    # Hydrate with DB metadata
    results = []
    for child_id, confidence in matches_raw:
        child = await MissingChild.find_one(MissingChild.child_id == child_id)
        if child:
            results.append(MatchResult(
                child_id=child.child_id,
                name=child.name,
                age=child.age,
                last_seen_location=child.last_seen_location,
                case_status=child.case_status,
                confidence_score=confidence,
                case_number=child.case_number,
                description=child.description,
            ))

    return {
        "status": status,
        "matches_found": len(results),
        "matches": [r.dict() for r in results],
        "privacy_note": "Uploaded image was not stored. Only facial embedding was used for search."
    }
