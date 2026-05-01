const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Nov06ember##',
  database: 'knot_db'
};

async function setupLecturerDatabase() {
  let connection;
  try {
    console.log("Connecting to MySQL knot_db for Lecturer setup...");
    connection = await mysql.createConnection(dbConfig);

    // Safety check: alter bookings to have new columns
    try {
      console.log("Adding assigned_lecturer to bookings...");
      await connection.query('ALTER TABLE bookings ADD COLUMN assigned_lecturer VARCHAR(255)');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
    }

    try {
      console.log("Adding purpose to bookings...");
      await connection.query('ALTER TABLE bookings ADD COLUMN purpose TEXT');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
    }

    // Insert Lecturer
    console.log("Ensuring Lecturer exists...");
    const [lectRows] = await connection.query(`SELECT * FROM users WHERE username = 'lecturer1'`);
    if (lectRows.length === 0) {
      await connection.query(`
        INSERT INTO users (username, password, name, role, department) 
        VALUES ('lecturer1', '1234', 'Dr. Smith', 'Lecturer', 'Department of Computer Engineering')
      `);
      console.log("Inserted Dr. Smith");
    }

    // Insert Student (if missing, though Student_Portal setup handles it usually)
    const [stuRows] = await connection.query(`SELECT id FROM users WHERE username = 'e22237'`);
    let studentId = stuRows.length > 0 ? stuRows[0].id : null;

    if (studentId) {
      // Create a mock pending request for Dr. Smith to approve
      console.log("Seeding mock student request for lecturer endorsement...");
      const [existingRequests] = await connection.query(`
        SELECT * FROM bookings WHERE assigned_lecturer = 'Dr. Smith' AND status = 'Pending'
      `);

      if (existingRequests.length === 0) {
        await connection.query(`
          INSERT INTO bookings (title, time_display, status, icon, user_id, assigned_lecturer, purpose) 
          VALUES ('LH01 - Lecture Hall 01', 'Next Monday, 10:00 AM', 'Pending', 'meeting_room', ?, 'Dr. Smith', 'Hackathon planning meeting')
        `, [studentId]);
        console.log("Inserted mock pending request.");
      }
    }

    console.log("Lecturer Database schema updated successfully!");
  } catch (error) {
    console.error("Database setup failed: ", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupLecturerDatabase();
