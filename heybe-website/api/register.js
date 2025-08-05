import bcrypt from "bcryptjs";
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable not set");
      return res.status(500).json({ error: "Database configuration error" });
    }

    const { email, password, name, guest_user_id } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gerekli" });
    }

    // Name is optional now
    const userName = name || email.split("@")[0]; // Use email prefix if no name provided

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir email adresi girin" });
    }

    // Password validation (minimum 6 karakter)
    if (password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Bu email adresi zaten kayıtlı" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID (use email as UUID for now)
    const uuid = email;

    // Insert new user into database
    const newUser = await pool.query(
      `INSERT INTO users (uuid, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING uuid, email, name, role`,
      [uuid, email, hashedPassword, userName, "user"]
    );

    // Transfer guest products to permanent user if guest_user_id provided
    if (guest_user_id && guest_user_id !== uuid) {
      try {
        console.log(
          `🔄 Starting product transfer from ${guest_user_id} to ${uuid}`
        );

        // First check if there are products to transfer
        const checkProducts = await pool.query(
          "SELECT COUNT(*) as count FROM products WHERE user_id = $1",
          [guest_user_id]
        );
        console.log(
          `📊 Found ${checkProducts.rows[0].count} products to transfer`
        );

        if (checkProducts.rows[0].count > 0) {
          const transferResult = await pool.query(
            "UPDATE products SET user_id = $1 WHERE user_id = $2 RETURNING id",
            [uuid, guest_user_id]
          );
          console.log(
            `✅ Transferred ${transferResult.rowCount} products from ${guest_user_id} to ${uuid}`
          );
        } else {
          console.log(
            `ℹ️ No products found for guest_user_id: ${guest_user_id}`
          );
        }
      } catch (transferError) {
        console.error("❌ Product transfer error:", transferError);
      }
    }

    // Return success response
    res.status(201).json({
      success: true,
      uuid: newUser.rows[0].uuid,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
      message: "Kayıt başarılı",
    });
  } catch (error) {
    console.error("❌ [API] Registration error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
