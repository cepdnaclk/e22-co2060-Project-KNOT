const mysql = require('mysql2/promise');

async function insertTestBooking() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Nov06ember##',
    database: 'knot_db',
  });

  try {
    const date = new Date().toISOString().split('T')[0];
    const timeDisplay = `${date} 10:00 AM - 11:00 AM`;
    const endTime = `${date} 11:00:00`;
    
    // Insert test booking for EOE Hall at 10 AM today
    await pool.query(
      'INSERT INTO bookings (title, time_display, user_id, icon, status, end_time, purpose) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['EOE Hall - Engineering South', timeDisplay, 1, 'meeting_room', 'Approved', endTime, 'Test Conflict Booking']
    );
    console.log(`Successfully created test booking for EOE Hall at ${timeDisplay}`);
  } catch (err) {
    console.error('Error inserting booking:', err.message);
  } finally {
    await pool.end();
  }
}

insertTestBooking();
