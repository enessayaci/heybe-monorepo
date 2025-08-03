// Login API endpoint
import bcrypt from 'bcryptjs';
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set');
      return res.status(500).json({ error: 'Database configuration error' });
    }



    const { email, password, guest_user_id } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gerekli" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir email adresi girin" });
    }

    // Find user in database
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }

    // Transfer guest products to permanent user if guest_user_id provided
    if (guest_user_id && guest_user_id !== user.uuid) {
      try {
        console.log(`🔄 Starting product transfer from ${guest_user_id} to ${user.uuid}`);
        
        // First check if there are products to transfer
        const checkProducts = await pool.query(
          "SELECT COUNT(*) as count FROM products WHERE user_id = $1",
          [guest_user_id]
        );
        console.log(`📊 Found ${checkProducts.rows[0].count} products to transfer`);
        
        if (checkProducts.rows[0].count > 0) {
          const transferResult = await pool.query(
            'UPDATE products SET user_id = $1 WHERE user_id = $2 RETURNING id',
            [user.uuid, guest_user_id]
          );
          console.log(`✅ Transferred ${transferResult.rowCount} products from ${guest_user_id} to ${user.uuid}`);
        } else {
          console.log(`ℹ️ No products found for guest_user_id: ${guest_user_id}`);
        }
      } catch (transferError) {
        console.error('❌ Product transfer error:', transferError);
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "Giriş başarılı",
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
