-- Neon PostgreSQL için tablo oluşturma
-- Bu SQL'i Neon SQL Editor'da çalıştır

-- Ürünler tablosu
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    price VARCHAR(100),
    image_url TEXT,
    product_url TEXT NOT NULL,
    site VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler (performans için)
CREATE INDEX idx_products_site ON products(site);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_url ON products(product_url);

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

-- Test verisi ekle (opsiyonel)
INSERT INTO products (name, price, image_url, product_url, site) VALUES
('Test Ürün 1', '₺99.99', 'https://example.com/image1.jpg', 'https://example.com/product1', 'example.com'),
('Test Ürün 2', '$29.99', 'https://example.com/image2.jpg', 'https://example.com/product2', 'example.com'); 