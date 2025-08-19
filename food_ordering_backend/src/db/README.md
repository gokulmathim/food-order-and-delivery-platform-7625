# Database Setup for Food Ordering Backend

This backend uses a conventional SQL database with a relational schema suited for food ordering workflows (users, restaurants, menus, carts, orders).
We wire up the backend to a Postgres (recommended) or MySQL database via environment variables, with schema managed by SQL migrations.

Supported engines:
- PostgreSQL (recommended)
- MySQL (works with minor type adjustments)

Environment variables (add these to .env; do not commit secrets):
- DB_CLIENT: postgres or mysql2
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_SSL: true|false (optional)

Example .env.example:
DB_CLIENT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=food_ordering
DB_USER=food_user
DB_PASSWORD=change_me
DB_SSL=false

Migration strategy:
- We provide SQL migration files under src/db/migrations with idempotent CREATE TABLE IF NOT EXISTS statements.
- Run migrations at app startup via the initDb script (called from src/app.js) to ensure tables exist.

Schema overview:
- users: authentication and profile
- restaurants: restaurant info
- categories: menu categories per restaurant (e.g., Starters)
- menu_items: items within categories
- carts: one active cart per user
- cart_items: items in a cart
- orders: placed orders
- order_items: items snapshot at order time
- addresses: user’s saved addresses (optional)
- payments: records payment intent/status (placeholder)
- refresh_tokens: optional table for token storage if needed

Indexes and constraints are defined to support typical queries.

NOTE: If using MySQL, TIMESTAMP/TZ features differ; columns use TIMESTAMP or DATETIME compatible with both engines.

How backend uses it:
- At startup, src/db/index.js reads env, connects, and runs migrations.
- Services/controllers can import query helpers from src/db/queries.js for common operations.

Security notes:
- Passwords must be hashed by the service layer; this DB layer stores hashed_password only.
- Avoid storing full payment details—store payment status/intent refs only.

