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

    const { product_id, user_id } = req.query;

    if (!product_id || !user_id) {
      return res.status(400).json({
        error: "Product ID and User ID are required",
      });
    }

    console.log("🗑️ [API] Deleting product:", product_id, "for user:", user_id);

    // Delete the product
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id",
      [product_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Product not found or not authorized",
      });
    }

    console.log("✅ [API] Product deleted successfully:", product_id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProductId: product_id,
    });
  } catch (error) {
    console.error("❌ [API] Delete product error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
