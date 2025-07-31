const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id parameter is required" });
    }

    console.log("👤 [Tüm Listem] Ürünler getiriliyor - Kullanıcı ID:", user_id);

    // Kullanıcının ürünlerini çek (en yeniler önce)
    const query = `
      SELECT 
        id,
        name,
        price,
        image_url,
        product_url,
        site,
        created_at,
        updated_at,
        user_id
      FROM products 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [user_id]);

    console.log(`📦 [Tüm Listem] ${result.rows.length} ürün bulundu`);

    res.status(200).json({
      success: true,
      products: result.rows,
      count: result.rows.length,
      user_id: user_id,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};