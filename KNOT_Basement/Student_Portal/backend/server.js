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

// Maintenance Admin Endpoints
const formatTicket = (fault) => ({
  id: fault.id,
  ticket_number: `TKT-${String(fault.id).padStart(4, '0')}`,
  title: fault.title,
  description: fault.description,
  priority: fault.priority || 'Low',
  status: fault.status,
  reported_at: fault.created_at,
  reported_by: fault.reporter_name || 'System User',
  location: fault.location || 'N/A',
  maintenance_notes: fault.maintenance_notes || null,
  photo_url: fault.photo_url || null
});

app.get('/api/tickets', async (req, res) => {
  try {
    const { search, priority, status, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT f.*, u.name as reporter_name 
      FROM faults f 
      LEFT JOIN users u ON f.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (f.title LIKE ? OR f.location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (priority) {
      query += ` AND f.priority = ?`;
      params.push(priority);
    }
    if (status) {
      query += ` AND f.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY f.created_at DESC`;
    const [allRows] = await pool.query(query, params);
    
    const offset = (page - 1) * limit;
    const paginatedRows = allRows.slice(offset, offset + Number(limit));

    res.json({
      data: paginatedRows.map(formatTicket),
      pagination: {
        total: allRows.length,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tickets/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT status, title as category 
      FROM faults
    `);
    
    const open = rows.filter(r => r.status === 'Open').length;
    const inProgress = rows.filter(r => r.status === 'In Progress').length;
    const resolvedToday = rows.filter(r => r.status === 'Resolved').length;

    const resolutionRates = [
      { category: 'Hardware', rate: 76 },
      { category: 'Software', rate: 92 },
      { category: 'General', rate: 85 }
    ];

    res.json({ open, inProgress, resolvedToday, resolutionRates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.name as reporter_name 
      FROM faults f 
      LEFT JOIN users u ON f.user_id = u.id 
      WHERE f.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(formatTicket(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  const { status, maintenance_notes, photo_url } = req.body;
  try {
    // Add columns if they missed initialization
    try { await pool.query('ALTER TABLE faults ADD COLUMN maintenance_notes TEXT'); } catch(e){}
    try { await pool.query('ALTER TABLE faults ADD COLUMN photo_url VARCHAR(255)'); } catch(e){}

    const updateFields = [];
    const params = [];
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (maintenance_notes !== undefined) { updateFields.push('maintenance_notes = ?'); params.push(maintenance_notes); }
    if (photo_url !== undefined) { updateFields.push('photo_url = ?'); params.push(photo_url); }
    
    if (status === 'Resolved') {
      updateFields.push('resolved_at = CURRENT_TIMESTAMP');
    }

    if (updateFields.length > 0) {
      params.push(req.params.id);
      await pool.query(`UPDATE faults SET ${updateFields.join(', ')} WHERE id = ?`, params);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
