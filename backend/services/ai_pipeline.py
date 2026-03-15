"""
AI Pipeline: MTCNN face detection + FaceNet embeddings
Privacy-first: images are NEVER stored, only 512-d embeddings
"""

import numpy as np
import io
from PIL import Image
import logging
from typing import Optional, Tuple
import os

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 512

# Try to import real AI libs; fall back to mock for demo
try:
    from facenet_pytorch import MTCNN, InceptionResnetV1
    import torch

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    _mtcnn = MTCNN(image_size=160, margin=20, device=_device, keep_all=False)
    _facenet = InceptionResnetV1(pretrained="vggface2").eval().to(_device)
    USE_REAL_AI = True
    logger.info(f"Real AI pipeline loaded (device={_device})")
except ImportError:
    USE_REAL_AI = False
    logger.warning("facenet_pytorch not installed – using deterministic mock embeddings for demo")


class AIPipeline:
    """Converts face images to privacy-safe embeddings"""

    async def process_image(self, image_bytes: bytes) -> Tuple[Optional[np.ndarray], str]:
        """
        Steps:
          1. Decode image
          2. Detect & crop face (MTCNN)
          3. Generate 512-d embedding (FaceNet)
          4. Return embedding (image bytes discarded immediately)
        Returns (embedding, status_message)
        """
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            del image_bytes  # Discard immediately for privacy

            if USE_REAL_AI:
                embedding = await self._real_pipeline(img)
            else:
                embedding = self._mock_pipeline(img)

            if embedding is None:
                return None, "No face detected in image"

            # L2-normalize for cosine-like distance
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm

            return embedding, "Face detected and embedded successfully"

        except Exception as e:
            logger.error(f"AI pipeline error: {e}")
            return None, f"Processing error: {str(e)}"

    async def _real_pipeline(self, img: Image.Image) -> Optional[np.ndarray]:
        import torch
        face_tensor = _mtcnn(img)
        if face_tensor is None:
            return None
        if face_tensor.dim() == 3:
            face_tensor = face_tensor.unsqueeze(0)
        face_tensor = face_tensor.to(_device)
        with torch.no_grad():
            embedding = _facenet(face_tensor).cpu().numpy().flatten()
        return embedding

    def _mock_pipeline(self, img: Image.Image) -> Optional[np.ndarray]:
        """
        Deterministic mock: derives a pseudo-embedding from image pixel statistics.
        Consistent for same image, different for different images.
        For demo/testing without GPU.
        """
        img_small = img.resize((64, 64))
        arr = np.array(img_small, dtype=np.float32)

        # Build a 512-d vector from image statistics (deterministic, not random)
        np.random.seed(int(arr.mean() * 1000) % 2**31)
        base = np.random.randn(EMBEDDING_DIM).astype(np.float32)

        # Add some pixel-based signal
        flat = arr.flatten()[:EMBEDDING_DIM]
        if len(flat) < EMBEDDING_DIM:
            flat = np.pad(flat, (0, EMBEDDING_DIM - len(flat)))
        base = base * 0.7 + (flat / 255.0 - 0.5) * 0.3

        return base.astype(np.float32)


ai_pipeline = AIPipeline()
