const { Pool } = require("pg");

// PostgreSQL bağlantı konfigürasyonu
const pool = new Pool({
  user: "postgres", // PostgreSQL kullanıcı adınız
  host: "localhost",
  database: "MyListDB", // Veritabanı adınız
  password: "123456", // PostgreSQL şifreniz
  port: 5432,
});

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  // Sadece GET isteklerini kabul et
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use GET." }),
    };
  }

  try {
    // Tüm ürünleri getir
    const query = `
      SELECT id, name, price, image_url, product_url, site, created_at, updated_at
      FROM products
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);
    const products = result.rows;

    console.log("✅ Ürünler başarıyla getirildi:", products.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Ürünler başarıyla getirildi",
        products: products,
        count: products.length,
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
