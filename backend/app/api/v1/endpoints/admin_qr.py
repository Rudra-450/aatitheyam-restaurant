from fastapi import APIRouter, Depends, Query, Response
from app.api.deps import get_current_owner
from app.core.config import settings
from app.models.owner import Owner
from app.services.qr_service import qr_service

router = APIRouter(tags=["Admin QR Management"])

@router.get("/download", summary="Download high-resolution print-ready menu QR code PNG")
async def download_menu_qr(
    current_owner: Owner = Depends(get_current_owner),
    size: int = Query(15, ge=5, le=40, description="QR box pixel size multiplier")
):
    qr_bytes = qr_service.generate_menu_qr(
        target_url=settings.PUBLIC_MENU_BASE_URL,
        box_size=size,
        border=4
    )
    return Response(
        content=qr_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": 'attachment; filename="restaurant-digital-menu-qr.png"',
            "Cache-Control": "no-cache",
        }
    )

@router.get("/info", summary="Get public menu target URL information")
async def get_qr_info(
    current_owner: Owner = Depends(get_current_owner)
):
    return {
        "menu_url": settings.PUBLIC_MENU_BASE_URL,
        "description": "Scan this QR code with any smartphone camera to instantly open the live view-only menu."
    }
