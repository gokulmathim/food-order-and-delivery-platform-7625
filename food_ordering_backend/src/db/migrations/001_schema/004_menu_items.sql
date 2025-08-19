-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id             BIGSERIAL PRIMARY KEY,
  restaurant_id  BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id    BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  image_url      VARCHAR(1024),
  price_cents    INT NOT NULL,
  currency       VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_available   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
