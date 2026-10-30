from fastapi import APIRouter
from app.api.v1.endpoints import (
    admin_category,
    admin_dashboard,
    admin_food,
    admin_qr,
    admin_restaurant,
    admin_upload,
    auth,
    public,
)

api_router = APIRouter()

# Public customer routes
api_router.include_router(public.router, prefix="", tags=["Public Menu"])

# Authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Administrative routes (protected)
api_router.include_router(admin_dashboard.router, prefix="/admin/dashboard", tags=["Admin Dashboard"])
api_router.include_router(admin_restaurant.router, prefix="/admin/restaurant", tags=["Admin Restaurant Profile"])
api_router.include_router(admin_category.router, prefix="/admin/categories", tags=["Admin Category Management"])
api_router.include_router(admin_food.router, prefix="/admin/food-items", tags=["Admin Food Management"])
api_router.include_router(admin_upload.router, prefix="/admin/uploads", tags=["Admin File Uploads"])
api_router.include_router(admin_qr.router, prefix="/admin/qr", tags=["Admin QR Management"])
