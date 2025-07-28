const { Pool } = require("pg");

// PostgreSQL bağlantı konfigürasyonu
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_bLEYoHIWzK12@ep-small-wildflower-a2k0k4l4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  // OPTIONS request için CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight successful" }),
    };
  }

  // Sadece DELETE isteklerini kabul et
  if (event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use DELETE." }),
    };
  }

  try {
    // Request body'yi parse et
    const body = JSON.parse(event.body);

    // ID kontrolü
    if (!body.id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required field: id",
        }),
      };
    }

    // Ürünü sil
    const query = `
      DELETE FROM products 
      WHERE id = $1 
      RETURNING id, name
    `;

    const result = await pool.query(query, [body.id]);

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "Product not found",
        }),
      };
    }

    const deletedProduct = result.rows[0];
    console.log("✅ Ürün başarıyla silindi:", deletedProduct);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Ürün başarıyla silindi",
        deletedProduct: deletedProduct,
      }),
    };
  } catch (error) {
    console.error("❌ Veritabanı hatası:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  } finally {
    // Bağlantıyı kapat
    await pool.end();
  }
};
