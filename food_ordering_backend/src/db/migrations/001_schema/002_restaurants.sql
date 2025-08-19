-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  cuisine_type  VARCHAR(128),
  logo_url      VARCHAR(1024),
  cover_image_url VARCHAR(1024),
  phone         VARCHAR(32),
  address       VARCHAR(512),
  city          VARCHAR(128),
  state         VARCHAR(128),
  postal_code   VARCHAR(32),
  country       VARCHAR(64),
  rating        NUMERIC(3,2) DEFAULT 0,
  is_open       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
