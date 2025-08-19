-- User addresses (optional)
CREATE TABLE IF NOT EXISTS addresses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(128), -- Home, Work
  line1       VARCHAR(255) NOT NULL,
  line2       VARCHAR(255),
  city        VARCHAR(128),
  state       VARCHAR(128),
  postal_code VARCHAR(32),
  country     VARCHAR(64),
  lat         DECIMAL(10,7),
  lng         DECIMAL(10,7),
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- Payments (placeholder for payment provider integration)
CREATE TABLE IF NOT EXISTS payments (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider      VARCHAR(64) NOT NULL, -- e.g., stripe
  provider_ref  VARCHAR(128),         -- payment intent id
  amount_cents  INT NOT NULL,
  currency      VARCHAR(3) NOT NULL DEFAULT 'USD',
  status        VARCHAR(32) NOT NULL DEFAULT 'created', -- created, succeeded, failed, refunded
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_order ON payments(order_id);

-- Refresh tokens (optional)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_token_hash ON refresh_tokens(token_hash);
