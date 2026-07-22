const mysql = require('mysql2/promise');

// Configuration for connecting without a database first
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'new_password'
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
        location TEXT,
        status VARCHAR(50) DEFAULT 'In Progress',
        priority VARCHAR(50) DEFAULT 'Medium',
        icon VARCHAR(50) DEFAULT 'construction',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME NULL,
        user_id INT,
        assigned_technician_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL
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
        assigned_lecturer VARCHAR(255),
        purpose TEXT,
        end_time VARCHAR(255),
        booking_type VARCHAR(50) DEFAULT 'AR Office',
        rejection_reason TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create Settings Table
    console.log("Creating Settings table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value VARCHAR(255) NOT NULL
      );
    `);
    await connection.query(`INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('auto_booking', 'true')`);

    // Safety Alterations for coexisting schemas
    console.log("Running schema compatibility alterations...");
    try { await connection.query("ALTER TABLE users ADD COLUMN username VARCHAR(255) UNIQUE"); } catch(e){}
    try { await connection.query("ALTER TABLE users ADD COLUMN password VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE users ADD COLUMN department VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE"); } catch(e){}
    try { await connection.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)"); } catch(e){}

    try { await connection.query("ALTER TABLE faults ADD COLUMN title VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN description TEXT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN priority VARCHAR(50) DEFAULT 'Medium'"); } catch(e){}
    try { await connection.query("ALTER TABLE faults MODIFY COLUMN location TEXT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN status VARCHAR(50) DEFAULT 'Open'"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN user_id INT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN icon VARCHAR(50) DEFAULT 'construction'"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN photo_url LONGTEXT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN worker_photo LONGTEXT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN assigned_technician_id INT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN maintenance_notes TEXT"); } catch(e){}
    try { await connection.query("ALTER TABLE faults ADD COLUMN admin_verified BOOLEAN DEFAULT FALSE"); } catch(e){}

    try { await connection.query("ALTER TABLE bookings ADD COLUMN title VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN time_display VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN icon VARCHAR(50)"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN user_id INT"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN assigned_lecturer VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN purpose VARCHAR(255)"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN end_time DATETIME"); } catch(e){}
    try { await connection.query("ALTER TABLE bookings ADD COLUMN booking_type VARCHAR(50) DEFAULT 'AR Office'"); } catch(e){}

    // Create Rooms Table
    console.log("Creating Rooms table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        capacity INT DEFAULT 30,
        type VARCHAR(50) DEFAULT 'Lecture Hall',
        status VARCHAR(50) DEFAULT 'Available'
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
        INSERT INTO bookings (title, time_display, status, icon, user_id, assigned_lecturer, purpose) VALUES 
        ('EOE Hall - Engineering South', 'Tomorrow, 10:00 AM', 'Approved', 'science', ?, NULL, 'General Study'),
        ('DO1 - Drawing Office 1', 'Friday, 02:30 PM', 'Pending', 'corporate_fare', ?, 'Dr. Smith', 'Group Discussion')
      `, [userId, userId]);
    }

    // Seed mock rooms
    const [roomRows] = await connection.query(`SELECT * FROM rooms`);
    if (roomRows.length === 0) {
      await connection.query(`
        INSERT INTO rooms (name, capacity, type, status) VALUES 
        ('EOE Hall - Engineering South', 120, 'Lecture Hall', 'Available'),
        ('DO1 - Drawing Office 1', 40, 'Drawing Office', 'Available'),
        ('DO2 - Drawing Office 2', 40, 'Drawing Office', 'Available'),
        ('LH01 - Lecture Hall 01', 80, 'Lecture Hall', 'Available'),
        ('LH02 - Lecture Hall 02', 80, 'Lecture Hall', 'Available'),
        ('Seminar Room A', 50, 'Seminar Room', 'Available'),
        ('Seminar Room B', 50, 'Seminar Room', 'Available'),
        ('Computer Lab 01', 60, 'Lab', 'Available'),
        ('Computer Lab 02', 60, 'Lab', 'Available'),
        ('Electronics Lab', 45, 'Lab', 'Available')
      `);
    }

    const [adminRows] = await connection.query(`SELECT * FROM users WHERE username = 'admin'`);
    if (adminRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('admin', 'adminpass', 'System Administrator', 'maintenance_admin', 'Facilities Management')
      `);
    }

    const [bookAdminRows] = await connection.query(`SELECT * FROM users WHERE username = 'bookadmin'`);
    if (bookAdminRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('bookadmin', 'adminpass', 'Booking Administrator', 'booking_admin', 'AR Office')
      `);
    }

    const [lecturerRows] = await connection.query(`SELECT * FROM users WHERE username = 'lecturer1'`);
    if (lecturerRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('lecturer1', '1234', 'Dr. Smith', 'Lecturer', 'Department of Computer Engineering')
      `);
    }

    const [alexRows] = await connection.query(`SELECT * FROM users WHERE username = 'alex'`);
    if (alexRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('alex', '1234', 'Alex Johnson', 'Technician', 'Facilities Management')
      `);
    }

    const [samRows] = await connection.query(`SELECT * FROM users WHERE username = 'sam'`);
    if (samRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('sam', '1234', 'Sam Carter', 'Technician', 'Facilities Management')
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
