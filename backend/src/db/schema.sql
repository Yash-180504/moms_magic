-- Mom's Magic Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                             CHECK (role IN ('customer', 'provider', 'admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Providers (kitchen profiles) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kitchen_name     VARCHAR(255) NOT NULL,
  description      TEXT,
  location         VARCHAR(255) NOT NULL,
  city             VARCHAR(100) NOT NULL DEFAULT 'Kolkata',
  address          TEXT,
  phone            VARCHAR(20),
  cover_image_url  TEXT,
  cover_image_id   VARCHAR(255),
  is_veg           BOOLEAN      NOT NULL DEFAULT FALSE,
  is_nonveg        BOOLEAN      NOT NULL DEFAULT FALSE,
  is_verified      BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  price_from       INTEGER      NOT NULL DEFAULT 60,
  delivery_time    VARCHAR(100),
  rating           NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  total_orders     INTEGER      NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Menu Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID         NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  price         INTEGER      NOT NULL,
  image_url     TEXT,
  image_id      VARCHAR(255),
  is_veg        BOOLEAN      NOT NULL DEFAULT TRUE,
  is_available  BOOLEAN      NOT NULL DEFAULT TRUE,
  category      VARCHAR(100),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Orders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID        NOT NULL REFERENCES users(id),
  provider_id      UUID        NOT NULL REFERENCES providers(id),
  status           VARCHAR(50) NOT NULL DEFAULT 'pending'
                               CHECK (status IN (
                                 'pending','confirmed','preparing',
                                 'out_for_delivery','delivered','cancelled'
                               )),
  total_amount     INTEGER     NOT NULL,
  delivery_address TEXT        NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Order Items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID    NOT NULL REFERENCES menu_items(id),
  name         VARCHAR(255) NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  price        INTEGER NOT NULL
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_providers_user_id    ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_city       ON providers(city);
CREATE INDEX IF NOT EXISTS idx_providers_is_active  ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_provider  ON menu_items(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer      ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider      ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
