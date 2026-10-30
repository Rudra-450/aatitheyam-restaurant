from fastapi import APIRouter, Depends, File, UploadFile
from app.api.deps import get_current_owner
from app.models.owner import Owner
from app.storage.service import storage_service

router = APIRouter(tags=["Admin File Uploads"])

@router.post("/food-image", summary="Upload and validate a food item image")
async def upload_food_image(
    file: UploadFile = File(...),
    current_owner: Owner = Depends(get_current_owner)
):
    url, public_id = await storage_service.save_image(file, subfolder="foods")
    return {
        "url": url,
        "public_id": public_id,
        "filename": file.filename,
    }

@router.post("/restaurant-logo", summary="Upload and validate restaurant logo")
async def upload_restaurant_logo(
    file: UploadFile = File(...),
    current_owner: Owner = Depends(get_current_owner)
):
    url, public_id = await storage_service.save_image(file, subfolder="logos")
    return {
        "url": url,
        "public_id": public_id,
        "filename": file.filename,
    }
