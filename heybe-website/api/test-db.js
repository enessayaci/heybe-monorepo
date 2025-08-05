// Test database connection API endpoint
import { testConnection, executeQuery, initDatabase } from './db.js';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: "DATABASE_URL environment variable not set",
        status: "failed"
      });
    }

    // Test database connection
    const connectionTest = await testConnection();
    if (!connectionTest) {
      return res.status(500).json({ 
        error: "Database connection failed",
        status: "failed"
      });
    }

    // Initialize database
    await initDatabase();

    // Check users table
    const usersCount = await executeQuery('SELECT COUNT(*) FROM users');
    
    // Check products table
    const productsCount = await executeQuery('SELECT COUNT(*) FROM products');

    res.status(200).json({
      status: "success",
      message: "Database connection successful",
      database_url: process.env.DATABASE_URL ? "Set" : "Not set",
      users_count: parseInt(usersCount.rows[0].count),
      products_count: parseInt(productsCount.rows[0].count),
      tables: {
        users: "exists",
        products: "exists"
      }
    });

  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ 
      error: "Database test failed",
      details: error.message,
      status: "failed"
    });
  }
} 