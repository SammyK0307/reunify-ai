# 🔍 Reunify AI — Lost & Found Face Match

> AI-powered facial recognition system for law enforcement to identify missing children.
> **Privacy-First**: Images are NEVER stored. Only 512-d facial embeddings are kept.

---

## 🏗️ Architecture

```
[Officer uploads image]
        ↓
[FastAPI backend]
        ↓
[MTCNN face detection]
        ↓
[FaceNet/ArcFace → 512-d embedding]
        ↓
[FAISS nearest-neighbor search]
        ↓
[MongoDB metadata fetch]
        ↓
[Top 3 matches + confidence scores]
        ↓
[Next.js frontend display]
```

## 📁 Project Structure

```
reunify-ai/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── seed_data.py             # Demo data seeder
│   ├── .env.example
│   ├── database/
│   │   └── mongodb.py           # MongoDB/Beanie connection
│   ├── models/
│   │   └── child.py             # MissingChild document model
│   ├── routers/
│   │   ├── auth.py              # POST /api/auth/login
│   │   ├── upload.py            # POST /api/upload
│   │   ├── children.py          # POST /api/register-child, GET /api/children
│   │   └── matches.py           # GET /api/matches
│   └── services/
│       ├── ai_pipeline.py       # MTCNN + FaceNet embedding pipeline
│       ├── faiss_service.py     # FAISS vector search
│       └── auth_service.py      # JWT authentication
├── frontend/
│   ├── pages/
│   │   ├── index.tsx            # Landing page
│   │   ├── login.tsx            # Auth page
│   │   ├── dashboard.tsx        # Command center
│   │   ├── upload.tsx           # Face search
│   │   ├── admin.tsx            # Register missing child (admin)
│   │   └── cases.tsx            # All case files
│   ├── components/
│   │   ├── Layout.tsx           # Sidebar + header
│   │   ├── FaceScanner.tsx      # Drag-drop upload with scan animation
│   │   ├── MatchCard.tsx        # Result card with confidence bar
│   │   └── ConfidenceBar.tsx    # Animated confidence score
│   ├── context/AuthContext.tsx  # JWT auth state
│   ├── lib/api.ts               # Axios API client
│   └── styles/globals.css
└── docker/
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── docker-compose.yml
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set MONGODB_URL and JWT_SECRET

uvicorn main:app --reload --port 8000
```

### 2. Seed Demo Data

```bash
cd backend
python seed_data.py
# Adds 5 demo missing children to MongoDB + FAISS index
```

### 3. Frontend Setup

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
# Opens at http://localhost:3000
```

### 4. Login

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Officer | officer@reunify.ai     | demo1234   |
| Admin   | admin@reunify.ai       | admin1234  |

---

## 🐳 Docker Setup

```bash
# From project root
cd docker
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to GitHub
2. New Web Service on render.com
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Env vars: `MONGODB_URL`, `JWT_SECRET`

### Frontend → Vercel

```bash
cd frontend
npx vercel
# Set: NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
```

---

## 📡 API Reference

| Method | Endpoint                  | Auth    | Description                    |
|--------|---------------------------|---------|--------------------------------|
| POST   | /api/auth/login            | None    | Get JWT token                  |
| GET    | /api/auth/me               | Officer | Current user info              |
| POST   | /api/upload                | Officer | Upload face image → top 3 matches |
| POST   | /api/register-child        | Admin   | Register missing child + embedding |
| GET    | /api/children              | Officer | List all case files            |
| PATCH  | /api/children/{id}/status  | Admin   | Update case status             |
| GET    | /api/matches               | Officer | Active cases summary           |
| GET    | /health                    | None    | Health + FAISS index size      |

### POST /api/upload Response

```json
{
  "status": "Face detected and embedded successfully",
  "matches_found": 3,
  "matches": [
    {
      "child_id": "uuid",
      "name": "Aryan Sharma",
      "age": 7,
      "last_seen_location": "Mumbai Central Station",
      "case_status": "active",
      "confidence_score": 87.4,
      "case_number": "MH-2024-001",
      "description": "Wearing blue school uniform"
    }
  ],
  "privacy_note": "Uploaded image was not stored."
}
```

---

## 🔒 Privacy Architecture

```
Image bytes → AI Pipeline → Embedding (512 floats) → MongoDB
     ↑                           ↑
  DELETED                   Only this stored
immediately                 (cannot reconstruct face)
```

- ✅ No photos ever written to disk or database
- ✅ Embeddings are mathematical vectors, not reconstructible images
- ✅ JWT-secured API endpoints
- ✅ Role-based access (officer vs admin)
- ✅ HTTPS required in production

---

## 🤖 AI Pipeline Details

| Component | Library         | Description                     |
|-----------|----------------|---------------------------------|
| Detection | MTCNN          | Multi-task CNN face detection   |
| Embedding | FaceNet/VGGFace2| 512-d biometric encoding       |
| Search    | FAISS IndexFlatL2| Exact nearest-neighbor search  |
| Fallback  | NumPy mock     | Demo mode without GPU required  |

**Confidence Score Formula:**
```
confidence = max(0, min(100, (1 - L2_distance / 4.0) * 100))
```
Normalized embeddings give L2 distances in [0, 2] for same person, [2, 4] for different.

---

## 🎯 Hackathon Demo Flow

1. Open `http://localhost:3000`
2. Login as officer
3. Dashboard shows system status + 5 demo cases
4. Click "Search by Face" → upload any photo
5. See top 3 matches with confidence scores
6. Login as admin → Register new missing child
7. Search again — new child appears in results

---

## 🔮 Future Enhancements

- [ ] CCTV video mode: extract faces from frames
- [ ] Age progression simulation
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Automatic AMBER Alert integration
- [ ] Federated search across jurisdictions

---

*Built for hackathon demonstration. For production deployment, obtain proper legal authorization, security audit, and privacy compliance certification.*
