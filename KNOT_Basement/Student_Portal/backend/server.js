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
  password: '',
  database: 'knot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT id, username, name, role, department FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faults Endpoints
app.get('/api/faults/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM faults WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/faults', async (req, res) => {
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

app.put('/api/faults/:id/resolve', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE faults SET status = "Resolved", resolved_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookings Endpoints
app.get('/api/bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Automatically delete bookings where end_time has passed
    await pool.query('DELETE FROM bookings WHERE end_time IS NOT NULL AND end_time < NOW()');

    const [rows] = await pool.query('SELECT * FROM bookings WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { title, time_display, user_id, icon, status, end_time } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO bookings (title, time_display, user_id, icon, status, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      [title, time_display, user_id, icon || 'meeting_room', status || 'Pending', end_time]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
