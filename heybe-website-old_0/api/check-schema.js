import pkg from "pg";
const { Pool } = pkg;

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

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database configuration error",
        details: "DATABASE_URL is not configured",
      });
    }

    console.log("🔍 [API] Checking database schema...");

    // Check products table structure
    const productsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);

    // Check users table structure
    const usersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    // Check sample data
    const sampleProducts = await pool.query(`
      SELECT * FROM products LIMIT 3;
    `);

    const sampleUsers = await pool.query(`
      SELECT * FROM users LIMIT 3;
    `);

    console.log("📊 [API] Database schema check completed");

    res.status(200).json({
      success: true,
      productsTable: {
        structure: productsStructure.rows,
        sampleData: sampleProducts.rows,
        rowCount: sampleProducts.rowCount,
      },
      usersTable: {
        structure: usersStructure.rows,
        sampleData: sampleUsers.rows,
        rowCount: sampleUsers.rowCount,
      },
    });
  } catch (error) {
    console.error("❌ [API] Schema check error:", error);
    res.status(500).json({
      error: "Schema check failed",
      details: error.message,
    });
  }
}
