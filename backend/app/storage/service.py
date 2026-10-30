import os
import uuid
from pathlib import Path
from PIL import Image
import io
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        # Dedicated subdirectories for food and logos
        (self.upload_dir / "foods").mkdir(exist_ok=True)
        (self.upload_dir / "logos").mkdir(exist_ok=True)

    async def save_image(self, file: UploadFile, subfolder: str = "foods") -> tuple[str, str]:
        """
        Validates and saves an uploaded image file.
        Returns a tuple of (public_url, storage_identifier).
        """
        # Read content
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
            )

        # Validate image format and sanity using Pillow
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
            # Re-open for format detection and potential optimization
            image = Image.open(io.BytesIO(content))
            image_format = image.format.lower() if image.format else "jpeg"
            if image_format not in ["jpeg", "jpg", "png", "webp"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image format. Supported formats: JPEG, PNG, WebP."
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not a valid or readable image."
            ) from e

        ext = "jpg" if image_format in ["jpeg", "jpg"] else image_format
        filename = f"{uuid.uuid4().hex}.{ext}"
        destination = self.upload_dir / subfolder / filename

        with open(destination, "wb") as f:
            f.write(content)

        relative_url = f"/uploads/{subfolder}/{filename}"
        public_id = f"{subfolder}/{filename}"
        return relative_url, public_id

    def delete_image(self, public_id: str | None) -> bool:
        """Removes an image asset from storage safely."""
        if not public_id:
            return False
        try:
            target = self.upload_dir / public_id
            if target.exists() and target.is_file():
                target.unlink()
                return True
        except Exception:
            pass
        return False

storage_service = StorageService()
