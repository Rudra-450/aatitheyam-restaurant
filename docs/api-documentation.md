# API Documentation & OpenAPI Specification

The FastAPI application auto-generates interactive Swagger and OpenAPI 3.0 documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON Schema**: `http://localhost:8000/openapi.json`

## API Endpoints Reference

### Public Customer Endpoints (Read-Only)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint returning status and version |
| `GET` | `/api/v1/restaurant` | Retrieve public restaurant profile and branding details |
| `GET` | `/api/v1/menu` | Retrieve complete aggregated public menu (categories + items) |
| `GET` | `/api/v1/categories` | Retrieve all active menu categories |
| `GET` | `/api/v1/food-items` | Query food items with filters (`category_id`, `food_type`, `is_available`, `q`) |

### Owner Authentication Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate owner; returns Bearer JWT and sets HTTP-only session cookie |
| `POST` | `/api/v1/auth/logout` | Invalidate owner session and clear HTTP-only cookie |
| `GET` | `/api/v1/auth/me` | Fetch authenticated owner profile |

### Administrative Management Endpoints (Owner Authorized)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard/stats` | Summary KPI metrics (total items, availability counts, categories, recent items) |
| `GET` | `/api/v1/admin/restaurant` | Retrieve editable restaurant profile |
| `PUT` | `/api/v1/admin/restaurant` | Update restaurant name, contact, address, hours, currency, or logo |
| `GET` | `/api/v1/admin/categories` | List all categories with item counts and display sequence |
| `POST` | `/api/v1/admin/categories` | Create a new menu category |
| `PUT` | `/api/v1/admin/categories/{id}` | Update category name, display order, or visibility |
| `DELETE` | `/api/v1/admin/categories/{id}` | Safely delete category (enforces 0 food items attached) |
| `PATCH` | `/api/v1/admin/categories/reorder` | Batch reorder category display positions |
| `GET` | `/api/v1/admin/food-items` | List all food items with admin details and filters |
| `POST` | `/api/v1/admin/food-items` | Create new food item with price validation |
| `GET` | `/api/v1/admin/food-items/{id}` | Retrieve single food item |
| `PUT` | `/api/v1/admin/food-items/{id}` | Update food item fields and replace image assets safely |
| `PATCH` | `/api/v1/admin/food-items/{id}/availability` | Instant quick-toggle for item live availability |
| `DELETE` | `/api/v1/admin/food-items/{id}` | Delete food item and clean up associated image files |
| `POST` | `/api/v1/admin/uploads/food-image` | Validate (Pillow magic bytes) and save food photo asset |
| `POST` | `/api/v1/admin/uploads/restaurant-logo` | Upload brand logo asset |
| `GET` | `/api/v1/admin/qr/download` | Download high-resolution print-ready menu QR code PNG (customizable size multiplier) |
| `GET` | `/api/v1/admin/qr/info` | Inspect public menu target URL information |
