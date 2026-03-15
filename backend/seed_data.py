"""
Seed script: populate MongoDB with demo missing children records.
Run: python seed_data.py
"""

import asyncio
import numpy as np
from database.mongodb import connect_db
from models.child import MissingChild
from services.faiss_service import faiss_service

DEMO_CHILDREN = [
    {"name": "Aryan Sharma", "age": 7, "gender": "male", "last_seen_location": "Mumbai Central Station", "last_seen_date": "2024-11-12", "description": "Wearing blue school uniform", "case_number": "MH-2024-001"},
    {"name": "Priya Patel", "age": 9, "gender": "female", "last_seen_location": "Pune Railway Station", "last_seen_date": "2024-10-05", "description": "Has a red backpack", "case_number": "MH-2024-002"},
    {"name": "Rahul Kumar", "age": 11, "gender": "male", "last_seen_location": "Delhi IGI Airport", "last_seen_date": "2024-12-01", "description": "Short hair, blue jeans", "case_number": "DL-2024-003"},
    {"name": "Meera Singh", "age": 6, "gender": "female", "last_seen_location": "Bangalore MG Road", "last_seen_date": "2024-09-20", "description": "Yellow dress, pigtails", "case_number": "KA-2024-004"},
    {"name": "Amit Verma", "age": 13, "gender": "male", "last_seen_location": "Chennai Marina Beach", "last_seen_date": "2024-11-28", "description": "Red t-shirt, carrying cricket bat", "case_number": "TN-2024-005"},
]

async def seed():
    await connect_db()
    await faiss_service.initialize()

    count = 0
    for data in DEMO_CHILDREN:
        existing = await MissingChild.find_one(MissingChild.case_number == data["case_number"])
        if existing:
            print(f"  Already exists: {data['name']}")
            continue

        # Generate deterministic mock embedding
        np.random.seed(hash(data["name"]) % 2**31)
        embedding = np.random.randn(512).astype(np.float32)
        embedding = embedding / np.linalg.norm(embedding)

        child = MissingChild(**data, embedding_vector=embedding.tolist())
        await child.insert()
        faiss_service.add_embedding(child.child_id, embedding)
        count += 1
        print(f"  Registered: {data['name']} ({data['case_number']})")

    print(f"\nSeeded {count} children. Total in FAISS: {faiss_service.index.ntotal}")

if __name__ == "__main__":
    asyncio.run(seed())
