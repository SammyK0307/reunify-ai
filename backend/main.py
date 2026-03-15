from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routers import upload, children, matches, auth, video
from database.mongodb import connect_db, disconnect_db
from services.faiss_service import faiss_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Reunify AI backend...")
    await connect_db()
    await faiss_service.initialize()
    logger.info("Backend ready")
    yield
    await disconnect_db()

app = FastAPI(title="Reunify AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://reunify-ai-mu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(children.router, prefix="/api", tags=["Children"])
app.include_router(video.router, prefix="/api", tags=["Video"])
app.include_router(matches.router, prefix="/api", tags=["Matches"])

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Reunify AI", "version": "1.0.0",
            "faiss_size": faiss_service.index.ntotal if faiss_service.index else 0}
