const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Nov06ember##',
  database: 'knot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication Endpoint (Lecturer)
app.post('/api/lecturer/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for username: ${username}`);
  try {
    const [rows] = await pool.query('SELECT id, username, name, role, department FROM users WHERE username = ? AND password = ?', [username, password]);
    console.log(`Found ${rows.length} rows for ${username}`);
    if (rows.length > 0) console.log(`User role: ${rows[0].role}`);
    
    if (rows.length > 0 && rows[0].role === 'Lecturer') {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials or not a Lecturer' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lecturer Faults
app.get('/api/lecturer/faults/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM faults WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lecturer/faults', async (req, res) => {
  const { title, description, priority, location, user_id, icon } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO faults (title, description, priority, location, user_id, icon, status) VALUES (?, ?, ?, ?, ?, ?, "In Progress")',
      [title, description, priority, location, user_id, icon]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lecturer Bookings (Go to AR)
app.get('/api/lecturer/bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lecturer/bookings', async (req, res) => {
  const { title, time_display, user_id, icon, status, end_time, purpose } = req.body;
  try {
    // Status is always "Pending AR" for Lecturer own bookings
    const finalStatus = 'Pending AR';
    
    const [result] = await pool.query(
      'INSERT INTO bookings (title, time_display, user_id, icon, status, end_time, purpose) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, time_display, user_id, icon || 'meeting_room', finalStatus, end_time || null, purpose]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Requests to Lecturer
app.get('/api/lecturer/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get lecturer name
    const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const lecturerName = userRows[0].name;

    const [rows] = await pool.query(
      'SELECT b.*, u.name as requestor_name FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.assigned_lecturer = ? AND b.status = "Pending" ORDER BY b.id DESC',
      [lecturerName]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forward request to AR
app.put('/api/lecturer/requests/:id/forward', async (req, res) => {
  const { id } = req.params;
  try {
    // Change state from Pending to Pending AR
    await pool.query('UPDATE bookings SET status = "Pending AR" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lecturer/requests/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE bookings SET status = "Rejected" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log('Lecturer Backend is running on port ' + PORT);
});
