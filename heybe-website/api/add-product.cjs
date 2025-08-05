const { Pool } = require("pg");

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async function handler(req, res) {
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
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is missing");
      return res.status(500).json({
        error: "Database configuration error",
        details: "DATABASE_URL is not configured",
      });
    }

    const { user_id, name, price, image_url, product_url } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({
        error: "User ID and product name are required",
      });
    }

    console.log("🔍 [API] Adding product for user:", user_id, "Product:", name);

    const query = `
      INSERT INTO products (user_id, name, price, image_url, product_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      user_id,
      name,
      price || null,
      image_url || null,
      product_url || null,
    ]);

    console.log("✅ [API] Product added successfully:", result.rows[0]);

    res.status(201).json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error("❌ [API] Database error:", error);

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    // Close the pool connection
    await pool.end();
  }
};
