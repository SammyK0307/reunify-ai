from fastapi import APIRouter, HTTPException, Security
from pydantic import BaseModel
from services.auth_service import verify_password, create_access_token, verify_token, DEMO_USERS

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(req: LoginRequest):
    user = DEMO_USERS.get(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": req.email, "role": user["role"], "name": user["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"]
    }


@router.get("/me")
async def me(payload: dict = Security(verify_token)):
    return {
        "email": payload["sub"],
        "role": payload["role"],
        "name": payload["name"]
    }