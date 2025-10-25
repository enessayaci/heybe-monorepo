-- ********** GÜVENLİK VE TEKRAR OLUŞTURMA İÇİN TEMİZLİK BÖLÜMÜ **********
-- PostgreSQL'de CREATE OR REPLACE TRIGGER komutu olmadığı için,
-- var olan tetikleyiciler HATA VERMEDEN SİLİNİR (Veri kaybı olmaz).

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- ************************************************************************


-- Users tablosu
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

-- is_guest için index
CREATE INDEX IF NOT EXISTS idx_users_is_guest ON users(is_guest);


-- Updated_at için PostgreSQL Fonksiyonu
-- CREATE OR REPLACE kullanıldığı için fonksiyon zaten varsa üzerine yazar (Hata vermez)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';


-- Kullanıcılar tablosu için Tetikleyiciyi oluştur (DROP yapıldığı için artık hata vermez)
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Products tablosu
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

-- Indexler
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_site ON products(site);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);


-- Products tablosu için updated_at trigger (DROP yapıldığı için artık hata vermez)
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();