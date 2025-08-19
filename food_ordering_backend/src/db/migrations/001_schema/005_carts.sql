-- Carts (one active cart per user)
CREATE TABLE IF NOT EXISTS carts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE SET NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'active', -- active, converted, abandoned
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id            BIGSERIAL PRIMARY KEY,
  cart_id       BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id  BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price_cents INT NOT NULL,
  currency      VARCHAR(3) NOT NULL DEFAULT 'USD',
  notes         VARCHAR(512)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_item_unique ON cart_items(cart_id, menu_item_id);
