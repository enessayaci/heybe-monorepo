CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email için index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- is_guest için index (misafir kullanıcıları hızlı filtrelemek için)
CREATE INDEX IF NOT EXISTS idx_users_is_guest ON users(is_guest);

-- Updated_at için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Products tablosu (güncellenmiş)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price VARCHAR(50) NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  url TEXT NOT NULL,
  site VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User_id için index
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Site için index (filtreleme için)
CREATE INDEX IF NOT EXISTS idx_products_site ON products(site);

-- Name için index (arama için)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Products tablosu için updated_at trigger
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();