# Database Design & Schema Specifications

## 1. Relational Entities & Constraints

The relational schema is normalized and enforced with PostgreSQL foreign keys and constraints.

### `restaurants`
- `id` (VARCHAR(36), PK): UUID identifier.
- `name` (VARCHAR(150), NOT NULL): Restaurant trade name.
- `logo_url` (VARCHAR(500), NULL): URL to hosted logo asset.
- `contact_number` (VARCHAR(50), NULL): Customer phone number.
- `address` (TEXT, NULL): Full street address.
- `opening_hours` (VARCHAR(100), NULL): Display operating hours.
- `currency` (VARCHAR(10), NOT NULL, DEFAULT '₹'): Currency symbol.
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

### `owners`
- `id` (VARCHAR(36), PK): UUID identifier.
- `restaurant_id` (VARCHAR(36), FK -> `restaurants.id` ON DELETE CASCADE, INDEX)
- `username` (VARCHAR(50), UNIQUE, NOT NULL, INDEX)
- `email` (VARCHAR(100), UNIQUE, NOT NULL, INDEX)
- `password_hash` (VARCHAR(255), NOT NULL): Argon2id password hash.
- `is_active` (BOOLEAN, NOT NULL, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

### `categories`
- `id` (VARCHAR(36), PK): UUID identifier.
- `restaurant_id` (VARCHAR(36), FK -> `restaurants.id` ON DELETE CASCADE, INDEX)
- `name` (VARCHAR(100), NOT NULL)
- `display_order` (INTEGER, NOT NULL, DEFAULT 0, INDEX)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT TRUE, INDEX)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- **Constraint**: `UNIQUE(restaurant_id, name)`

### `food_items`
- `id` (VARCHAR(36), PK): UUID identifier.
- `restaurant_id` (VARCHAR(36), FK -> `restaurants.id` ON DELETE CASCADE, INDEX)
- `category_id` (VARCHAR(36), FK -> `categories.id` ON DELETE RESTRICT, INDEX)
- `name` (VARCHAR(150), NOT NULL, INDEX)
- `image_url` (VARCHAR(500), NULL)
- `image_public_id` (VARCHAR(200), NULL)
- `price` (NUMERIC(10, 2), NOT NULL): Exact monetary representation.
- `food_type` (VARCHAR(20), NOT NULL, DEFAULT 'VEG', INDEX): 'VEG' or 'NON_VEG'.
- `is_available` (BOOLEAN, NOT NULL, DEFAULT TRUE, INDEX)
- `display_order` (INTEGER, NOT NULL, DEFAULT 0, INDEX)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- **Constraint**: `CHECK (price >= 0)`

## 2. Integrity Protections

1. **Category Safe Deletion**: Foreign key on `food_items.category_id` uses `ON DELETE RESTRICT`. In addition, repository-level business logic rejects category deletion requests if any food items are attached, returning HTTP `409 Conflict`.
2. **Monetary Precision**: Prices are strictly stored as `NUMERIC(10, 2)` and validated via Python `decimal.Decimal` and Pydantic decimal places validation, avoiding IEEE 754 binary floating-point roundoff issues.
