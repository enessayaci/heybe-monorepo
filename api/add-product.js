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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  // Sadece POST isteklerini kabul et
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  try {
    // Request body'yi parse et
    const body = JSON.parse(event.body);

    // Gerekli alanları kontrol et
    if (!body.name || !body.product_url || !body.site) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: name, product_url, site",
        }),
      };
    }

    // Ürünü veritabanına ekle
    const query = `
      INSERT INTO products (name, price, image_url, product_url, site)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, price, image_url, product_url, site, created_at
    `;

    const values = [
      body.name,
      body.price || null,
      body.image_url || null,
      body.product_url,
      body.site,
    ];

    const result = await pool.query(query, values);
    const newProduct = result.rows[0];

    console.log("✅ Ürün başarıyla eklendi:", newProduct);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Ürün başarıyla eklendi",
        product: newProduct,
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
