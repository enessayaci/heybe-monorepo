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
    const { id, user_id } = req.body;

    if (!id || !user_id) {
      return res
        .status(400)
        .json({ error: "Product ID and User ID are required" });
    }

    const query = `
      DELETE FROM products 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, user_id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Product not found or not authorized" });
    }

    console.log("👤 [Tüm Listem] Kullanıcı ürünü silindi:", user_id, "->", id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
