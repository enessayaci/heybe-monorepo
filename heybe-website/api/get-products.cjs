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

  if (req.method !== "GET") {
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

    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log("🔍 [API] Getting products for user:", user_id);

    // First, check if products table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error("❌ [API] Products table does not exist");
      return res.status(500).json({
        error: "Database schema error",
        details: "Products table does not exist",
      });
    }

    // Get table structure for debugging
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);

    console.log("📊 [API] Products table structure:", tableStructure.rows);

    // Use the existing table structure - don't assume column names
    const query = `
      SELECT * FROM products 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [user_id]);

    console.log(
      "✅ [API] Products retrieved successfully:",
      user_id,
      "(",
      result.rows.length,
      "products)"
    );

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("❌ [API] Database error:", error);

    // More detailed error response
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
