const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// Initialize missing columns in faults table if they don't exist
async function initDB() {
  try {
    await pool.query('ALTER TABLE faults ADD COLUMN maintenance_notes TEXT');
  } catch(err) {
    if (err.code !== 'ER_DUP_FIELDNAME') console.error("DB init error (notes):", err.message);
  }
  try {
    await pool.query('ALTER TABLE faults ADD COLUMN photo_url VARCHAR(255)');
  } catch(err) {
    if (err.code !== 'ER_DUP_FIELDNAME') console.error("DB init error (photo):", err.message);
  }
}
initDB();

// Helper to format fault to ticket
const formatTicket = (fault) => ({
  id: fault.id,
  ticket_number: `KNT-${1000 + fault.id}`,
  title: fault.title,
  description: fault.description,
  location: fault.location,
  priority: fault.priority,
  status: fault.status === 'In Progress' ? 'In Progress' : fault.status === 'Resolved' ? 'Resolved' : 'Open',
  reported_by: fault.reporter_name || 'Unknown',
  reported_at: fault.created_at,
  maintenance_notes: fault.maintenance_notes || '',
  category: 'General',
  photo_url: fault.photo_url || null
});

// Login an administrator
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'adminpass') {
    res.json({ token: 'mock-jwt-token-12345', name: 'System Admin' });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
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
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Server error fetching tickets' });
  }
});

app.get('/api/tickets/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT status FROM faults`);
    
    // Map existing statuses to Open/In Progress/Resolved
    const mappedStatuses = rows.map(r => r.status === 'In Progress' ? 'In Progress' : r.status === 'Resolved' ? 'Resolved' : 'Open');
    
    const open = mappedStatuses.filter(s => s === 'Open').length;
    const inProgress = mappedStatuses.filter(s => s === 'In Progress').length;
    const resolvedToday = mappedStatuses.filter(s => s === 'Resolved').length;
    
    res.json({
      open,
      inProgress,
      resolvedToday,
      resolutionRates: [
        { category: 'Electrical Issues', rate: 85 },
        { category: 'Furniture Repairs', rate: 60 },
        { category: 'HVAC Maintenance', rate: 45 }
      ]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    let id = req.params.id;
    if (id.startsWith('KNT-')) {
      id = parseInt(id.replace('KNT-', ''), 10) - 1000;
    }
    
    const [rows] = await pool.query(`
      SELECT f.*, u.name as reporter_name 
      FROM faults f 
      LEFT JOIN users u ON f.user_id = u.id 
      WHERE f.id = ?
    `, [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    res.json(formatTicket(rows[0]));
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Server error fetching ticket' });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    let id = req.params.id;
    if (id.startsWith('KNT-')) {
      id = parseInt(id.replace('KNT-', ''), 10) - 1000;
    }
    
    const { status, maintenance_notes, photo_url } = req.body;
    let updateQuery = 'UPDATE faults SET ';
    const params = [];
    
    if (status) {
      updateQuery += 'status = ?, ';
      params.push(status);
      if (status === 'Resolved') {
        updateQuery += 'resolved_at = CURRENT_TIMESTAMP, ';
      }
    }
    if (maintenance_notes !== undefined) {
      updateQuery += 'maintenance_notes = ?, ';
      params.push(maintenance_notes);
    }
    if (photo_url !== undefined) {
      updateQuery += 'photo_url = ?, ';
      params.push(photo_url);
    }
    
    updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
    params.push(id);
    
    await pool.query(updateQuery, params);
    res.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Server error updating ticket' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
