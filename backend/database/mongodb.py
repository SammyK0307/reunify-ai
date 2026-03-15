from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os

client = None
db = None

async def connect_db():
    global client, db
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client.reunify_ai
    from models.child import MissingChild
    await init_beanie(database=db, document_models=[MissingChild])

async def disconnect_db():
    if client:
        client.close()

def get_db():
    return db
