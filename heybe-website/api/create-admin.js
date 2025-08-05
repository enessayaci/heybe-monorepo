// Create admin user script
import bcrypt from 'bcryptjs';
import { executeQuery, initDatabase } from './db.js';

async function createAdminUser() {
  try {
    // Initialize database
    await initDatabase();

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await executeQuery(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    await executeQuery(
      `INSERT INTO users (uuid, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, $5)`,
      [adminEmail, adminEmail, hashedPassword, adminName, 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser(); 