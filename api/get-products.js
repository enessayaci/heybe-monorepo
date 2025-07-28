const { Pool } = require("pg");

// PostgreSQL bağlantı konfigürasyonu
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_bLEYoHIWzK12@ep-small-wildflower-a2k0k4l4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
};
