-- Tüm Listem Database Schema
-- Neon PostgreSQL için

-- Products tablosu
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price VARCHAR(50),
    image_url TEXT,
    product_url TEXT NOT NULL,
    site VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL, -- UUID için
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Örnek veri (isteğe bağlı)
-- INSERT INTO products (name, price, image_url, product_url, site, user_id) VALUES 
-- ('Test Ürün', '100 TL', 'https://example.com/image.jpg', 'https://example.com/product', 'example.com', 'test-user-id');

-- Updated_at otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 