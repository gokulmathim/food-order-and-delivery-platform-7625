-- Users table: authentication and profile
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(32),
  hashed_password VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255),
  avatar_url    VARCHAR(1024),
  role          VARCHAR(32) NOT NULL DEFAULT 'customer', -- customer, admin, courier
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
