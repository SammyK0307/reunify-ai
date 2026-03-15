"""
Bonus: CCTV simulation – extract faces from video frames.
POST /api/video-search
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Security
from services.ai_pipeline import ai_pipeline
from services.faiss_service import faiss_service
from services.auth_service import verify_token
from models.child import MissingChild, MatchResult
import io, logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/video-search")
async def video_search(
    file: UploadFile = File(...),
    payload: dict = Security(verify_token)
):
    """Extract faces from video frames and search each one"""
    try:
        import cv2
        import numpy as np
        from PIL import Image
    except ImportError:
        raise HTTPException(status_code=501, detail="OpenCV not installed. Run: pip install opencv-python-headless")

    video_bytes = await file.read()
    if len(video_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Video too large (max 50MB)")

    # Write to temp buffer for OpenCV
    nparr = np.frombuffer(video_bytes, np.uint8)
    del video_bytes

    # Decode video
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(nparr.tobytes())
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    os.unlink(tmp_path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    sample_interval = max(1, int(fps))  # 1 frame per second

    all_matches: dict[str, dict] = {}
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        if frame_count % sample_interval != 0:
            continue

        # Convert BGR → RGB → PIL
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)

        buf = io.BytesIO()
        pil_img.save(buf, format='JPEG', quality=85)
        embedding, status = await ai_pipeline.process_image(buf.getvalue())
        del buf

        if embedding is None:
            continue

        matches = faiss_service.search(embedding, top_k=1)
        for child_id, confidence in matches:
            if confidence >= 60:  # Only confident matches
                if child_id not in all_matches or all_matches[child_id]['confidence'] < confidence:
                    child = await MissingChild.find_one(MissingChild.child_id == child_id)
                    if child:
                        all_matches[child_id] = {
                            "child_id": child_id,
                            "name": child.name,
                            "age": child.age,
                            "confidence": confidence,
                            "frame": frame_count,
                        }

    cap.release()

    sorted_matches = sorted(all_matches.values(), key=lambda x: x['confidence'], reverse=True)

    return {
        "frames_analyzed": frame_count // sample_interval,
        "total_frames": frame_count,
        "matches_found": len(sorted_matches),
        "matches": sorted_matches[:5],
        "privacy_note": "Video frames were not stored."
    }
