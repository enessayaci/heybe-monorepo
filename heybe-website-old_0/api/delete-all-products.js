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

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") {
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
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    console.log("🗑️ [API] Deleting all products for user:", user_id);

    // Delete all products for the user
    const result = await pool.query(
      "DELETE FROM products WHERE user_id = $1 RETURNING id",
      [user_id]
    );

    console.log(
      "✅ [API] Deleted",
      result.rowCount,
      "products for user:",
      user_id
    );

    res.status(200).json({
      success: true,
      message: "All products deleted successfully",
      deletedCount: result.rowCount,
    });
  } catch (error) {
    console.error("❌ [API] Bulk delete error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
