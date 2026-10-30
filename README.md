# Restaurant Digital Menu Management Platform

A commercial-grade, production-ready digital menu management system designed specifically for premium restaurant establishments. It delivers two decoupled experiences: an elegant, mobile-first, view-only customer menu accessible via physical QR code scans or public URL, and a private administration suite for real-time menu customization, price management, availability control, and high-resolution QR asset generation.

---

## 1. Project Overview

- **Customer Interface**: Frictionless, mobile-optimized digital menu. Diners scan table QR codes or open `/menu` to browse dishes, examine food photography, filter dietary categories (Pure Veg / Non-Veg), and observe live availability in real-time.
- **Strictly View-Only**: Phase 1 deliberately excludes ordering, cart, checkout, or payments, maximizing clarity, performance, and dine-in operational focus.
- **Owner Dashboard**: Secure administrative dashboard allowing the restaurant owner to add, edit, reorder, and delete categories and dishes, instantly toggle availability, update branding, and download print-ready QR codes without modifying code.

---

## 2. Core Features

### Customer Experience (`/menu`)
- **Luxury Aesthetic**: Clean dark-luxury color palette, bespoke serif typography, and balanced whitespace.
- **Real-Time Synchronization**: Automatic 15-second background synchronization via TanStack Query keeps prices and statuses fresh.
- **Dietary Emblems**: Classic Pure Veg (green) and Non-Veg (red) markers on every food card.
- **Availability State**: Unavailable items remain visible with an unmistakable "Currently Unavailable" badge and visual dimming, preventing customer confusion.
- **Instant Search & Filters**: Search dishes by keyword, filter by category tabs, or toggle dietary classifications.

### Owner Administration Suite (`/admin`)
- **Operations Dashboard**: Live metrics on total dishes, currently available items, unavailable counts, and categories.
- **Food Catalog Management**: Full CRUD operations for menu items with numeric price validations in ₹ (INR).
- **Instant Availability Switch**: Quick toggle on dashboard and food tables to mark items available/unavailable in one click.
- **Category Organization**: Create categories, customize sequence with drag/move controls, and safely protect populated categories from accidental deletion.
- **Image Management**: Safe file upload handler verifying Pillow magic bytes (PNG, JPEG, WebP) with automatic disk cleanup of obsolete files upon replacement or deletion.
- **Restaurant Profile**: Configure establishment name, logo, contact number, opening hours, and currency.
- **QR Code Studio**: Download high-resolution PNG QR codes with customizable size multipliers (10x to 30x print-ready 300 DPI) and preview print-ready table display cards.

---

## 3. Architecture

The system implements a **Modular Monolith** pattern:
- **Backend**: Python 3.13 + FastAPI async framework with SQLAlchemy 2.0 ORM and Alembic migrations.
- **Frontend**: React 18 + TypeScript + Vite single-page application styled with Tailwind CSS.
- **Security**: Argon2id password hashing, HTTP-Only session cookies, and dependency-injected endpoint authorization checks.
- **Storage**: Pluggable storage architecture with local filesystem adapter for zero-config development and production object-storage readiness.

---

## 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, Lucide React, Axios, React Hook Form, Zod |
| **Backend** | Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Alembic, Argon2-cffi, Pillow, QRCode |
| **Database** | PostgreSQL 16 (Production / Docker), SQLite Async (Local fallback) |
| **Testing** | Pytest, HTTPX, pytest-asyncio (Backend); Vitest, React Testing Library, jsdom (Frontend) |
| **DevOps** | Docker, Docker Compose, Nginx Alpine |

---

## 5. Installation Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose for containerized deployment

### Repository Setup
```bash
git clone <repository-url>
cd "Restuarent system"
```

---

## 6. Environment Variables

Create `.env` inside `backend/` (or copy from `backend/.env.example`):
```env
PROJECT_NAME="Restaurant Digital Menu Management"
API_V1_PREFIX=/api/v1
SECRET_KEY="generate-a-secure-random-32-byte-hex-string"
ACCESS_TOKEN_EXPIRE_MINUTES=10080
COOKIE_NAME=restaurant_owner_session

# For PostgreSQL in Docker:
# DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@localhost:5432/restaurant_db

# For Local zero-config SQLite:
DATABASE_URL=sqlite+aiosqlite:///./restaurant.db

PUBLIC_MENU_BASE_URL=http://localhost:3000/menu
```

---

## 7. Database Setup

### Local SQLite (Zero-Config)
The application will automatically initialize `backend/restaurant.db` upon initial startup.

### PostgreSQL (Local or Docker)
If running a local PostgreSQL instance:
```sql
CREATE DATABASE restaurant_db;
```
Ensure `DATABASE_URL` in `backend/.env` points to your PostgreSQL credentials.

---

## 8. Migration Instructions

Run database migrations using Alembic:
```bash
cd backend
.\venv\Scripts\alembic upgrade head
```
To generate a new migration after schema changes:
```bash
.\venv\Scripts\alembic revision --autogenerate -m "Describe migration"
```

---

## 9. Owner Account Creation (Bootstrap)

Run the secure CLI bootstrap command to initialize the restaurant profile, create the owner account, and seed initial luxury menu items:
```bash
cd backend
.\venv\Scripts\python -m app.cli.bootstrap <username> <email> <password>
```
Default bootstrap command:
```bash
.\venv\Scripts\python -m app.cli.bootstrap admin owner@royalsaffron.com Admin@12345
```

---

## 10. Backend Startup

Activate the Python virtual environment and launch Uvicorn:
```bash
cd backend
.\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs are available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

---

## 11. Frontend Startup

Install dependencies and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at:
- **Customer Public Menu**: `http://localhost:3000/menu`
- **Owner Admin Dashboard**: `http://localhost:3000/admin` (or `/login`)

---

## 12. Testing Instructions

### Run Backend Tests (Pytest)
```bash
cd backend
.\venv\Scripts\pytest -v
```
All 9 unit and integration tests verify authentication security, public menu responses, availability toggles, price modifications, and safe category deletion constraints.

### Run End-to-End Workflow Verification Script
```bash
cd backend
.\venv\Scripts\python tests\verify_e2e_workflows.py
```
Verifies Workflows 1 through 7 end-to-end against the running backend server.

### Run Frontend Tests (Vitest & RTL)
```bash
cd frontend
npm test
```
Verifies food card rendering, Pure Veg dietary badges, availability status alerts, and strict read-only enforcement.

---

## 13. Docker Instructions

Run the entire platform (PostgreSQL database, FastAPI backend, and Nginx-served frontend) with Docker Compose:
```bash
docker compose up -d --build
```
Services started:
- PostgreSQL on `localhost:5432`
- FastAPI Backend on `http://localhost:8000`
- React Frontend (Nginx) on `http://localhost:3000`

To stop containers:
```bash
docker compose down
```

---

## 14. Production Deployment Instructions

1. **Environment Security**: Generate a cryptographically strong 32-byte secret key for `SECRET_KEY` in production `.env`.
2. **Reverse Proxy & SSL**: Terminate TLS/HTTPS via Nginx, Cloudflare, or AWS ALB. Set `secure=True` on cookies when serving over HTTPS.
3. **Static Media Volumes**: Ensure the `/app/static/uploads` volume in Docker is backed up regularly or configure S3 / Cloudinary object storage.
4. **Health Check Monitoring**: Point uptime monitoring tools to `GET /health` which returns `{"status": "healthy"}`.

---

## 15. Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`401 Unauthorized` on admin actions** | Missing or expired token | Sign in via `/login` to obtain an authenticated session cookie or Bearer token. |
| **`409 Conflict` on category deletion** | Category contains active food items | Intentional safety check. Reassign or delete the food items in that category before deleting it. |
| **Image upload fails** | File is not a valid image or exceeds 5MB | Ensure the file is an authentic JPEG, PNG, or WebP image under 5 megabytes. |
| **Menu changes not immediately visible on mobile** | Stale cache on mobile browser | The public menu automatically synchronizes every 15 seconds. Tap the browser refresh or change categories to immediately refresh data. |

---

## Definition of Success Verification

- **Customer View**: Accessible at `/menu`, displays luxury restaurant branding, live categories, food cards with Veg/Non-Veg indicators, formatted prices, unavailable badges, and zero order buttons.
- **Owner Dashboard**: Accessible at `/admin`, supports full food and category CRUD, image uploads, price adjustments, inline availability toggling, profile management, and print-ready QR code downloads.
- **Technical Excellence**: PostgreSQL-ready schema with exact `NUMERIC(10, 2)` monetary representations, Argon2id security, Alembic migrations, 100% automated test pass rate, and full Docker containerization.
