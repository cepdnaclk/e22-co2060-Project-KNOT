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
  password: 'new_password',
  database: 'knot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try { await pool.query('ALTER TABLE bookings ADD COLUMN end_time DATETIME'); } catch(e){}
  try { await pool.query('ALTER TABLE bookings ADD COLUMN assigned_lecturer VARCHAR(255)'); } catch(e){}
  try { await pool.query('ALTER TABLE bookings ADD COLUMN purpose TEXT'); } catch(e){}
  try { await pool.query('ALTER TABLE bookings ADD COLUMN rejection_reason TEXT'); } catch(e){}
  try { await pool.query('ALTER TABLE faults ADD COLUMN maintenance_notes TEXT'); } catch(e){}
  try { await pool.query('ALTER TABLE faults ADD COLUMN photo_url VARCHAR(255)'); } catch(e){}
  try { await pool.query('ALTER TABLE faults ADD COLUMN assigned_technician_id INT'); } catch(e){}
}
initDB();

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
  const { title, time_display, user_id, icon, status, end_time, assigned_lecturer, purpose } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO bookings (title, time_display, user_id, icon, status, end_time, assigned_lecturer, purpose) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, time_display, user_id, icon || 'meeting_room', status || 'Pending', end_time, assigned_lecturer || null, purpose || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lecturer Endpoints
app.get('/api/lecturer/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const lecturerName = userRows[0].name;

    const [rows] = await pool.query(
      'SELECT b.*, u.name as requestor_name FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.assigned_lecturer = ? ORDER BY b.id DESC',
      [lecturerName]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lecturer/requests/:id/forward', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE bookings SET status = "Pending AR" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lecturer/requests/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    await pool.query('UPDATE bookings SET status = "Rejected", rejection_reason = ? WHERE id = ?', [reason || null, id]);
    res.json({ success: true });
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
  photo_url: fault.photo_url || null,
  assigned_technician_id: fault.assigned_technician_id || null,
  assigned_technician_name: fault.technician_name || null
});

app.get('/api/tickets', async (req, res) => {
  try {
    const { search, priority, status, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT f.*, u.name as reporter_name, tech.name as technician_name
      FROM faults f 
      LEFT JOIN users u ON f.user_id = u.id 
      LEFT JOIN users tech ON f.assigned_technician_id = tech.id
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
      SELECT f.*, u.name as reporter_name, tech.name as technician_name
      FROM faults f 
      LEFT JOIN users u ON f.user_id = u.id 
      LEFT JOIN users tech ON f.assigned_technician_id = tech.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(formatTicket(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  const { status, maintenance_notes, photo_url, assigned_technician_id } = req.body;
  try {
    // Add columns if they missed initialization
    try { await pool.query('ALTER TABLE faults ADD COLUMN maintenance_notes TEXT'); } catch(e){}
    try { await pool.query('ALTER TABLE faults ADD COLUMN photo_url VARCHAR(255)'); } catch(e){}
    try { await pool.query('ALTER TABLE faults ADD COLUMN assigned_technician_id INT'); } catch(e){}

    const updateFields = [];
    const params = [];
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (maintenance_notes !== undefined) { updateFields.push('maintenance_notes = ?'); params.push(maintenance_notes); }
    if (photo_url !== undefined) { updateFields.push('photo_url = ?'); params.push(photo_url); }
    if (assigned_technician_id !== undefined) { updateFields.push('assigned_technician_id = ?'); params.push(assigned_technician_id); }
    
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

// Technician List (for admin assignment)
app.get('/api/admin/technicians', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, username, department FROM users WHERE role = 'Technician'");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Technician Tasks (get assigned faults)
app.get('/api/technician/tickets/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.name as reporter_name, tech.name as technician_name
      FROM faults f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN users tech ON f.assigned_technician_id = tech.id
      WHERE f.assigned_technician_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    res.json(rows.map(formatTicket));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Technician Task Update
app.put('/api/technician/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, maintenance_notes } = req.body;
  try {
    const updateFields = [];
    const params = [];
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (maintenance_notes !== undefined) { updateFields.push('maintenance_notes = ?'); params.push(maintenance_notes); }
    
    if (status === 'Resolved') {
      updateFields.push('resolved_at = CURRENT_TIMESTAMP');
    }

    if (updateFields.length > 0) {
      params.push(id);
      await pool.query(`UPDATE faults SET ${updateFields.join(', ')} WHERE id = ?`, params);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Booking Admin Endpoints
app.get('/api/admin/bookings/stats', async (req, res) => {
  try {
    const [bookings] = await pool.query(`SELECT COUNT(*) AS totalBookings FROM bookings WHERE title IS NOT NULL`);
    const [pendingBookings] = await pool.query(`SELECT COUNT(*) AS pendingBookings FROM bookings WHERE status = 'Pending AR'`);
    
    res.json({
        totalBookingsToday: bookings[0].totalBookings, // using total bookings since we don't have created_at yet
        pendingBookings: pendingBookings[0].pendingBookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/pending-bookings', async (req, res) => {
  try {
    const [approvals] = await pool.query(`
        SELECT 
            b.id, 
            b.title as room_name, 
            b.time_display as booking_date, 
            b.status,
            b.assigned_lecturer,
            u.name AS user_name, 
            u.role
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'Pending AR'
    `);
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; 

  if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
  }

  if (action === 'approve') {
      try {
          const [booking] = await pool.query('SELECT title, time_display FROM bookings WHERE id = ?', [id]);
          if (booking.length > 0) {
              const { title, time_display } = booking[0];
              const [overlapping] = await pool.query(
                  'SELECT id FROM bookings WHERE title = ? AND time_display = ? AND status = "Approved" AND id != ?', 
                  [title, time_display, id]
              );
              if (overlapping.length > 0) {
                  return res.status(409).json({ error: 'Cannot approve: Room is already booked for this time.' });
              }
          }
      } catch (err) {
          return res.status(500).json({ error: err.message });
      }
  }

  const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
  const rejectionReason = action === 'reject' ? (reason || null) : null;

  try {
      const [result] = await pool.query(
          'UPDATE bookings SET status = ?, rejection_reason = ? WHERE id = ?',
          [newStatus, rejectionReason, id]
      );
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Booking not found' });
      }
      res.json({ message: `Booking successfully ${newStatus}` });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
app.get('/api/admin/all-bookings', async (req, res) => {
  try {
    const [bookings] = await pool.query(`
        SELECT 
            b.id, 
            b.title as room_name, 
            b.time_display as booking_date, 
            b.status,
            b.rejection_reason,
            b.assigned_lecturer,
            u.name AS user_name, 
            u.role
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.id DESC
    `);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/rooms', async (req, res) => {
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/rooms', async (req, res) => {
  const { name, capacity, type, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO rooms (name, capacity, type, status) VALUES (?, ?, ?, ?)',
      [name, capacity || 30, type || 'Lecture Hall', status || 'Available']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk validate semester pre-bookings
app.post('/api/admin/bookings/bulk-validate', async (req, res) => {
  const { semesterStart, semesterEnd, rows } = req.body;
  if (!semesterStart || !semesterEnd || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Missing parameter(s). Required: semesterStart, semesterEnd, rows' });
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  try {
    const generatedBookings = [];

    // Parse date strings in local time to avoid timezone shift
    const [startYear, startMonth, startDay] = semesterStart.split('-').map(Number);
    const [endYear, endMonth, endDay] = semesterEnd.split('-').map(Number);

    for (const row of rows) {
      const { roomName, dayOfWeek, startTime, endTime, purpose, lecturer } = row;
      const targetDayIdx = daysOfWeek.indexOf(dayOfWeek);
      if (targetDayIdx === -1) continue;
      if (!roomName || !startTime || !endTime) continue;

      let current = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);

      while (current <= end) {
        if (current.getDay() === targetDayIdx) {
          const dateString = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

          // Format start and end times
          const sTime = typeof startTime === 'string' && startTime.includes(':') ? startTime : '08:30';
          const eTime = typeof endTime === 'string' && endTime.includes(':') ? endTime : '10:30';

          const [startH, startM] = sTime.split(':');
          const [endH, endM] = eTime.split(':');

          const startHourInt = parseInt(startH) || 0;
          const startMinInt = parseInt(startM) || 0;
          const endHourInt = parseInt(endH) || 0;
          const endMinInt = parseInt(endM) || 0;

          const startAmPm = startHourInt >= 12 ? 'PM' : 'AM';
          const startDisp = `${String(startHourInt > 12 ? startHourInt - 12 : startHourInt === 0 ? 12 : startHourInt).padStart(2, '0')}:${String(startMinInt).padStart(2, '0')} ${startAmPm}`;

          const endAmPm = endHourInt >= 12 ? 'PM' : 'AM';
          const endDisp = `${String(endHourInt > 12 ? endHourInt - 12 : endHourInt === 0 ? 12 : endHourInt).padStart(2, '0')}:${String(endMinInt).padStart(2, '0')} ${endAmPm}`;

          const timeDisplay = `${dateString} ${startDisp} - ${endDisp}`;
          const formattedEndTime = `${dateString} ${String(endHourInt).padStart(2, '0')}:${String(endMinInt).padStart(2, '0')}:00`;

          // Check overlap
          const [overlapping] = await pool.query(
            'SELECT id, title, time_display, purpose FROM bookings WHERE title = ? AND time_display = ? AND status = "Approved"',
            [roomName, timeDisplay]
          );

          generatedBookings.push({
            room_name: roomName,
            date: dateString,
            day_of_week: dayOfWeek,
            time_display: timeDisplay,
            end_time: formattedEndTime,
            purpose: purpose,
            assigned_lecturer: lecturer,
            valid: overlapping.length === 0,
            conflict_details: overlapping.length > 0 ? `Conflicts with: "${overlapping[0].purpose}"` : null
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    res.json(generatedBookings);
  } catch (err) {
    console.error("Bulk validation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk insert bookings
app.post('/api/admin/bookings/bulk-insert', async (req, res) => {
  const { bookings, userId } = req.body;
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).json({ error: 'Missing or empty bookings array.' });
  }

  try {
    let successCount = 0;
    for (const b of bookings) {
      // First, confirm it doesn't already conflict
      const [overlapping] = await pool.query(
        'SELECT id FROM bookings WHERE title = ? AND time_display = ? AND status = "Approved"',
        [b.room_name, b.time_display]
      );

      if (overlapping.length === 0) {
        await pool.query(
          'INSERT INTO bookings (title, time_display, status, icon, user_id, assigned_lecturer, purpose, end_time) VALUES (?, ?, "Approved", ?, ?, ?, ?, ?)',
          [
            b.room_name,
            b.time_display,
            b.room_name.toLowerCase().includes('lab') ? 'science' : 'corporate_fare',
            userId || null,
            b.assigned_lecturer || null,
            b.purpose || null,
            b.end_time
          ]
        );
        successCount++;
      }
    }
    res.json({ success: true, count: successCount });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
