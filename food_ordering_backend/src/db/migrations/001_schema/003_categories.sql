-- Menu categories per restaurant
CREATE TABLE IF NOT EXISTS categories (
  id             BIGSERIAL PRIMARY KEY,
  restaurant_id  BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  position       INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
