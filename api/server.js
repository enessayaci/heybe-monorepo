import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const port = 3000;

// CORS middleware
app.use(cors());
app.use(express.json());

// PostgreSQL bağlantı konfigürasyonu
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_bLEYoHIWzK12@ep-small-wildflower-a2k0k4l4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET /api/get-products
app.get("/api/get-products", async (req, res) => {
  try {
    const query = `
      SELECT id, name, price, image_url, product_url, site, created_at, updated_at
      FROM products
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    const products = result.rows;

    console.log("✅ Ürünler başarıyla getirildi:", products.length);

    res.json({
      success: true,
      message: "Ürünler başarıyla getirildi",
      products: products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ Veritabanı hatası:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// POST /api/add-product
app.post("/api/add-product", async (req, res) => {
  try {
    const { name, price, image_url, url, site, user_id } = req.body;

    if (!name || !url || !site || !user_id) {
      return res.status(400).json({
        error: "Missing required fields: name, url, site, user_id",
      });
    }

    // Check if user exists, if not create a guest user
    const userCheck = await pool.query(
      "SELECT uuid FROM users WHERE uuid = $1",
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      // Create a guest user automatically
      await pool.query(
        `INSERT INTO users (uuid, email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, `${user_id}@guest.com`, "guest", "Guest User", "user"]
      );
      console.log("✅ Guest user created automatically:", user_id);
    }

    const query = `
      INSERT INTO products (name, price, image_url, url, site, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, price, image_url, url, site, user_id, created_at
    `;

    const values = [name, price || null, image_url || null, url, site, user_id];

    const result = await pool.query(query, values);
    const newProduct = result.rows[0];

    console.log("✅ Ürün başarıyla eklendi:", newProduct);

    res.status(201).json({
      success: true,
      message: "Ürün başarıyla eklendi",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Veritabanı hatası:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// DELETE /api/delete-product
app.delete("/api/delete-product", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Missing required field: id",
      });
    }

    const query = `
      DELETE FROM products 
      WHERE id = $1 
      RETURNING id, name
    `;

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const deletedProduct = result.rows[0];
    console.log("✅ Ürün başarıyla silindi:", deletedProduct);

    res.json({
      success: true,
      message: "Ürün başarıyla silindi",
      deletedProduct: deletedProduct,
    });
  } catch (error) {
    console.error("❌ Veritabanı hatası:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// POST /api/register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name, guest_user_id } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gerekli" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir email adresi girin" });
    }

    // Password validation (minimum 6 karakter)
    if (password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Bu email adresi zaten kayıtlı" });
    }

    // Hash password (basit hash - production'da bcrypt kullanın)
    const hashedPassword = Buffer.from(password).toString("base64");

    // Generate UUID (use email as UUID for now)
    const uuid = email;

    // Name is optional
    const userName = name || email.split("@")[0];

    // Insert new user into database
    const newUser = await pool.query(
      `INSERT INTO users (uuid, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING uuid, email, name, role`,
      [uuid, email, hashedPassword, userName, "user"]
    );

    // Transfer guest products to permanent user if guest_user_id provided
    if (guest_user_id && guest_user_id !== uuid) {
      try {
        await pool.query(
          "UPDATE products SET user_id = $1 WHERE user_id = $2",
          [uuid, guest_user_id]
        );
        console.log(`✅ Transferred products from ${guest_user_id} to ${uuid}`);
      } catch (transferError) {
        console.error("❌ Product transfer error:", transferError);
      }
    }

    // Return success response
    res.status(201).json({
      success: true,
      uuid: newUser.rows[0].uuid,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
      message: "Kayıt başarılı",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST /api/login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, guest_user_id } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gerekli" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir email adresi girin" });
    }

    // Find user in database
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }

    const user = userResult.rows[0];

    // Verify password (basit hash - production'da bcrypt kullanın)
    const hashedPassword = Buffer.from(password).toString("base64");
    if (hashedPassword !== user.password_hash) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }

    // Transfer guest products to permanent user if guest_user_id provided
    if (guest_user_id && guest_user_id !== user.uuid) {
      try {
        await pool.query(
          "UPDATE products SET user_id = $1 WHERE user_id = $2",
          [user.uuid, guest_user_id]
        );
        console.log(
          `✅ Transferred products from ${guest_user_id} to ${user.uuid}`
        );
      } catch (transferError) {
        console.error("❌ Product transfer error:", transferError);
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "Giriş başarılı",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API server is running",
    timestamp: new Date().toISOString(),
  });
});

// Initialize database tables
async function initDatabase() {
  try {
    // Drop existing tables if they exist
    await pool.query("DROP TABLE IF EXISTS products CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");

    console.log("🗑️ Existing tables dropped");

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        uuid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table WITHOUT foreign key constraint
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name TEXT NOT NULL,
        price VARCHAR(100),
        site VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query("CREATE INDEX idx_users_uuid ON users(uuid)");
    await pool.query("CREATE INDEX idx_users_email ON users(email)");
    await pool.query("CREATE INDEX idx_users_role ON users(role)");
    await pool.query("CREATE INDEX idx_products_user_id ON products(user_id)");

    console.log("✅ Database tables initialized (NO FOREIGN KEY CONSTRAINT)");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

app.listen(port, async () => {
  console.log(`🚀 API server running at http://localhost:${port}`);
  console.log(`📦 Available endpoints:`);
  console.log(`   GET  /api/get-products`);
  console.log(`   POST /api/add-product`);
  console.log(`   DELETE /api/delete-product`);
  console.log(`   POST /api/register`);
  console.log(`   POST /api/login`);
  console.log(`   GET  /api/health`);

  // Initialize database
  try {
    await initDatabase();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
});
