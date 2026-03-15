"""JWT authentication for law enforcement users - bcrypt compatible version"""

from datetime import datetime, timedelta
from typing import Optional
import os
import jwt
import bcrypt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("JWT_SECRET", "reunify-secret-key-123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12

security = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# Demo users - passwords hashed at import time using bcrypt directly
DEMO_USERS = {
    "officer@reunify.ai": {
        "password_hash": hash_password("demo1234"),
        "role": "officer",
        "name": "Officer Demo",
    },
    "admin@reunify.ai": {
        "password_hash": hash_password("admin1234"),
        "role": "admin",
        "name": "Admin User",
    },
}


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin(payload: dict = Security(verify_token)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload