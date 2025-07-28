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

  // Only allow DELETE method
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
};
