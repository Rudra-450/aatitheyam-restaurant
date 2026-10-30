# System Architecture & Technical Specifications

## 1. High-Level Architectural Pattern

The platform is designed as a **Modular Monolith** optimizing for high data consistency, low latency, and zero distributed system bloat for a single restaurant establishment.

```
+-----------------------------------------------------------------------------------------+
|                                    CUSTOMER DEVICES                                     |
|  - Table QR Scans                                                                       |
|  - Mobile Safari / Chrome Browser                                                       |
|  - Desktop Browsers                                                                     |
+-----------------------------------------------------------------------------------------+
                                             |
                                    GET /menu, GET /api/v1/menu
                                             v
+-----------------------------------------------------------------------------------------+
|                                      FRONTEND SPA                                       |
|  - React 18 + TypeScript + Vite                                                         |
|  - Tailwind CSS (Bespoke Luxury Aesthetics)                                             |
|  - TanStack Query v5 (Automatic background cache invalidation & 15s live sync)          |
|  - React Hook Form + Zod Validations                                                    |
|  - Lucide React Iconography                                                             |
+-----------------------------------------------------------------------------------------+
                                             |
                                  JSON REST APIs (FastAPI)
                                             v
+-----------------------------------------------------------------------------------------+
|                                     BACKEND API                                         |
|  - Python 3.13 + FastAPI Asynchronous Architecture                                     |
|  - Argon2id Password Hashing (`argon2-cffi`)                                            |
|  - Token & Cookie Authentication Dependency (`get_current_owner`)                       |
|  - Storage Service (Pillow magic-byte inspection & safe asset removal)                  |
|  - High-Resolution QR Generator (PIL + `qrcode`)                                       |
+-----------------------------------------------------------------------------------------+
                                             |
                                  SQLAlchemy 2.0 Async Session
                                             v
+-----------------------------------------------------------------------------------------+
|                                   DATA PERSISTENCE                                      |
|  - PostgreSQL (Production / Docker) / SQLite Async (Local Dev)                          |
|  - Strict NUMERIC(10, 2) Monetary Columns (Zero floating-point inaccuracies)           |
|  - Foreign Key Constraints & Safe Deletion Enforcement (RESTRICT)                      |
|  - Alembic Version-Controlled Migrations                                                |
+-----------------------------------------------------------------------------------------+
```

## 2. Real-Time Synchronization Strategy

To ensure diners viewing the digital menu via mobile QR scans immediately see updated prices, new items, or unavailable statuses without requiring heavy WebSocket infrastructures:
- **TanStack Query** is configured with `staleTime: 10000` (10 seconds), `refetchInterval: 15000` (15-second background polling), and `refetchOnWindowFocus: true`.
- When an owner updates an item in the Admin Dashboard, the mutation immediately invalidates the query keys (`['publicMenu']`, `['adminFoodItems']`, `['adminDashboardStats']`), guaranteeing fresh updates.

## 3. Strict Read-Only Customer Boundary

- The public API surface exposes strictly read-only endpoints:
  - `GET /api/v1/restaurant`
  - `GET /api/v1/menu`
  - `GET /api/v1/categories`
  - `GET /api/v1/food-items`
- Any administrative endpoints (`/api/v1/admin/*`) require cryptographic authentication via `get_current_owner`.
- The customer UI contains zero order, add-to-cart, or checkout controls. Unavailable items remain visible with an explicit "Currently Unavailable" badge.
