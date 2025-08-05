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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database configuration error",
        details: "DATABASE_URL is not configured",
      });
    }

    console.log("🔧 [API] Setting up database schema...");

    // Create products table
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2),
        image_url TEXT,
        product_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await pool.query(createProductsTable);
    console.log("✅ [API] Products table created/verified");

    await pool.query(createUsersTable);
    console.log("✅ [API] Users table created/verified");

    await pool.query(createIndexes);
    console.log("✅ [API] Indexes created/verified");

    // Check table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);

    console.log("📊 [API] Products table structure:", tableStructure.rows);

    res.status(200).json({
      success: true,
      message: "Database schema setup completed",
      productsTableStructure: tableStructure.rows,
    });
  } catch (error) {
    console.error("❌ [API] Database setup error:", error);
    res.status(500).json({
      error: "Database setup failed",
      details: error.message,
    });
  } finally {
    await pool.end();
  }
}
