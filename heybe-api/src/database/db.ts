import path from "path";
import { Pool } from "pg";
import * as fs from "fs"; // Dosya sistemini okumak için 'fs' modülünü ekleyin

// Debug için environment variable'ları kontrol et
console.log("DB Environment Variables:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "undefined");
console.log("DB_PORT:", process.env.DB_PORT);

if (
  !process.env.DB_HOST ||
  !process.env.DB_NAME ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD
) {
  throw new Error("Veritabanı bağlantı bilgileri eksik");
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

// KRİTİK: Dosya yolunu konteynerin içinde ayarlayın
const SCHEMA_FILE_PATH = path.join(__dirname, "schema.sql");
// Not: Konteynerin içindeki tam yola göre düzenlenmesi gerekebilir!

export async function connectToDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log("✅ Veritabanına başarıyla bağlanıldı");

    // 1. Dosya içeriğini oku
    const schemaSQL = fs.readFileSync(SCHEMA_FILE_PATH, "utf8");

    // 2. SQL komutlarını çalıştır
    // IF NOT EXISTS kullandığınız sürece bu güvenlidir.
    await client.query(schemaSQL);
    console.log(
      "✅ Veritabanı şeması (schema.sql) başarıyla senkronize edildi/oluşturuldu"
    );

    return true;
  } catch (error) {
    console.error("❌ Veritabanı bağlantı veya şema oluşturma hatası:", error);
    throw error;
  } finally {
    if (client) {
      client.release(); // Bağlantıyı havuza geri bırak
    }
  }
}
