const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

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
    const { name, price, image_url, product_url, site } = req.body;

    if (!name || !product_url || !site) {
      return res.status(400).json({
        error: "Missing required fields: name, product_url, site",
      });
    }

    const query = `
      INSERT INTO products (name, price, image_url, product_url, site)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, price, image_url, product_url, site, created_at
    `;

    const values = [name, price || null, image_url || null, product_url, site];

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

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API server is running",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`🚀 API server running at http://localhost:${port}`);
  console.log(`📦 Available endpoints:`);
  console.log(`   GET  /api/get-products`);
  console.log(`   POST /api/add-product`);
  console.log(`   DELETE /api/delete-product`);
  console.log(`   GET  /api/health`);
});
