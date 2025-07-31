import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, price, image_url, product_url, site } = req.body;

    if (!name || !product_url || !site) {
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

    // Veritabanına kaydet
    const query = `
      INSERT INTO products (name, price, image_url, product_url, site, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const values = [
      truncatedName,
      price || "",
      image_url || "",
      product_url,
      truncatedSite,
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
}
