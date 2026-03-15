from fastapi import APIRouter, Security
from services.auth_service import verify_token
from models.child import MissingChild

router = APIRouter()

@router.get("/matches")
async def get_recent_matches(payload: dict = Security(verify_token)):
    """Get all active cases for dashboard"""
    children = await MissingChild.find(MissingChild.case_status == "active").to_list()
    return {
        "total_active_cases": len(children),
        "cases": [{
            "child_id": c.child_id, "name": c.name, "age": c.age,
            "last_seen_location": c.last_seen_location,
            "last_seen_date": c.last_seen_date, "case_number": c.case_number,
        } for c in children]
    }
