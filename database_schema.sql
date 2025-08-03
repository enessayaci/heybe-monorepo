-- User Tablosu SQL Scripti
-- Role sistemi ile birlikte

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products tablosu (mevcut)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    price VARCHAR(100),
    site VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- Admin kullanıcı oluşturma (örnek)
INSERT INTO users (uuid, email, password_hash, role) 
VALUES (
    'admin-uuid-123',
    'admin@example.com',
    '$2b$10$hashedpasswordhere', -- bcrypt ile hash'lenmiş şifre
    'admin'
) ON CONFLICT (uuid) DO NOTHING;

-- Normal kullanıcı oluşturma (örnek)
INSERT INTO users (uuid, email, password_hash, role) 
VALUES (
    'user-uuid-456',
    'user@example.com',
    '$2b$10$hashedpasswordhere', -- bcrypt ile hash'lenmiş şifre
    'user'
) ON CONFLICT (uuid) DO NOTHING;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 