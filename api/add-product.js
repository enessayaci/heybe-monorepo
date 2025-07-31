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

  // Handle GET request - Ürünleri getir
  if (req.method === "GET") {
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

      return res.status(200).json({
        success: true,
        products: result.rows,
        count: result.rows.length,
        user_id: user_id,
      });
    } catch (error) {
      console.error("GET Database error:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  // Handle POST request - Ürün ekle
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, price, image_url, product_url, site, user_id } = req.body;

    if (!name || !product_url || !site || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ürün adını 100 karaktere kısalt
    const truncatedName =
      name.length > 100 ? name.substring(0, 97) + "..." : name;

    // Site adını da kısalt (50 karakter)
    const truncatedSite =
      site.length > 50 ? site.substring(0, 47) + "..." : site;

    console.log("📝 [Tüm Listem] Ürün adı kısaltıldı:", truncatedName);
    console.log("📝 [Tüm Listem] Site adı kısaltıldı:", truncatedSite);
    console.log("👤 [Tüm Listem] Kullanıcı ID:", user_id);

    // Veritabanına kaydet
    const query = `
      INSERT INTO products (name, price, image_url, product_url, site, user_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const values = [
      truncatedName,
      price || "",
      image_url || "",
      product_url,
      truncatedSite,
      user_id,
    ];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
