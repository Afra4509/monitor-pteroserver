import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

export async function initDb() {
  try {
    const db = getDb();
    
    // Create users table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Insert admin with password Mikasa29 if no users exist
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if ((rows as any[]).length === 0) {
      await db.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', 'Mikasa29']);
      console.log('Admin user initialized with default password.');
    }

    // Create security logging tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        user_agent TEXT,
        action VARCHAR(50) NOT NULL,
        path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS ip_blocks (
        ip VARCHAR(45) PRIMARY KEY,
        failed_attempts INT DEFAULT 0,
        block_expires TIMESTAMP NULL,
        is_banned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    return true;
  } catch (error) {
    console.warn('[DB] Database offline or initialization failed.');
    return false;
  }
}
