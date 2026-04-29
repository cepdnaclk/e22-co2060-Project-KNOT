const mysql = require('mysql2/promise');

async function seedPending() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'knot_db'
  });

  await pool.query(`
    INSERT INTO bookings (title, time_display, status, icon, user_id, assigned_lecturer, purpose) VALUES
    ('Lab A - Computer Science', 'Today, 10:00 AM - 12:00 PM', 'Pending AR', 'computer', 1, 'Dr. Smith', 'Final Year Project Meeting'),
    ('Conference Room 2', 'Tomorrow, 2:00 PM - 4:00 PM', 'Pending AR', 'meeting_room', 1, 'Dr. Smith', 'Research Presentation'),
    ('EOE - Seminar Hall', 'Friday, 9:00 AM - 11:00 AM', 'Pending AR', 'school', 1, 'Dr. Smith', 'Workshop Session')
  `);

  console.log('3 pending bookings seeded successfully!');
  process.exit(0);
}

seedPending().catch(console.error);
