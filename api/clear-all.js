import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async (req, res) => {
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
    const { user_id } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ error: "User ID is required" });
    }

    const query = `
      DELETE FROM products 
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [user_id]);

    console.log("🗑️ [Tüm Listem] Kullanıcının tüm ürünleri silindi:", user_id, "->", result.rowCount, "ürün");

    res.status(200).json({
      success: true,
      message: "All products deleted successfully",
      deletedCount: result.rowCount,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}; 