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

  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
};
