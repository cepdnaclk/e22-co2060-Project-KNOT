const mysql = require('mysql2/promise');

// Configuration for connecting without a database first
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '' // Default password is empty, change if needed
};

async function setupDatabase() {
  let connection;
  try {
    console.log("Connecting to MySQL...");
    connection = await mysql.createConnection(dbConfig);
    
    // Create database manually
    console.log("Creating database knot_db...");
    await connection.query(`CREATE DATABASE IF NOT EXISTS knot_db;`);
    await connection.query(`USE knot_db;`);
    
    // Create Users Table
    console.log("Creating Users table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50),
        department VARCHAR(255)
      );
    `);

    
    // Create Faults Table
    console.log("Creating Faults table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS faults (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'In Progress',
        priority VARCHAR(50) DEFAULT 'Medium',
        icon VARCHAR(50) DEFAULT 'construction',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create Bookings Table
    console.log("Creating Bookings table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        time_display VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        icon VARCHAR(50) DEFAULT 'meeting_room',
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Seeding mock user
    console.log("Seeding Mock Data...");
    const [rows] = await connection.query(`SELECT * FROM users WHERE username = 'e22237'`);
    if (rows.length === 0) {
      const [insertResult] = await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('e22237', '1234', 'Minhaj Ali', 'Student', 'Department of Computer Engineering')
      `);
      
      const userId = insertResult.insertId;

      // Seed mock faults
      await connection.query(`
        INSERT INTO faults (title, status, priority, icon, user_id) VALUES 
        ('Projector Room 1', 'In Progress', 'Low', 'potted_plant', ?),
        ('HVAC Unit B4', 'Resolved', 'Medium', 'ac_unit', ?)
      `, [userId, userId]);

      // Seed mock bookings
      await connection.query(`
        INSERT INTO bookings (title, time_display, status, icon, user_id) VALUES 
        ('EOE - Main Lab', 'Tomorrow, 10:00 AM', 'Approved', 'science', ?),
        ('DO1 - Seminar Hall', 'Friday, 02:30 PM', 'Pending', 'corporate_fare', ?)
      `, [userId, userId]);
    }

    const [adminRows] = await connection.query(`SELECT * FROM users WHERE username = 'admin'`);
    if (adminRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('admin', 'adminpass', 'System Administrator', 'maintenance_admin', 'Facilities Management')
      `);
    }

    console.log("Database initialized and mock data seeded successfully!");

  } catch (error) {
    console.error("Database setup failed: ", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
