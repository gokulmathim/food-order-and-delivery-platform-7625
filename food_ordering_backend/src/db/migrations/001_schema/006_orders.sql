-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE SET NULL,
  cart_id         BIGINT REFERENCES carts(id) ON DELETE SET NULL,
  total_cents     INT NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
  status          VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, confirmed, preparing, out_for_delivery, delivered, cancelled
  payment_status  VARCHAR(32) NOT NULL DEFAULT 'unpaid', -- unpaid, paid, failed, refunded
  delivery_address VARCHAR(512),
  delivery_lat    DECIMAL(10,7),
  delivery_lng    DECIMAL(10,7),
  placed_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estimated_ready_at TIMESTAMP,
  estimated_delivery_at TIMESTAMP,
  tracking_code   VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Order items (snapshot of items and prices)
CREATE TABLE IF NOT EXISTS order_items (
  id              BIGSERIAL PRIMARY KEY,
  order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id    BIGINT REFERENCES menu_items(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price_cents INT NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
  notes           VARCHAR(512)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
