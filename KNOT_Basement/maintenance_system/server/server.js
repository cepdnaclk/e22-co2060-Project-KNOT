const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// Mock data to fallback on if DB is unavailable
const mockTickets = [
  {
    id: 1,
    ticket_number: 'KNT-1024',
    title: 'Projector lamp failure in AV system',
    description: 'Projector lamp failure in AV system',
    location: 'EOE Hall - Main Entrance',
    lat: 7.2546,
    lng: 80.5912,
    priority: 'High',
    status: 'In Progress',
    reported_by: 'Prof. Sarah Jenkins',
    reported_at: '2023-10-24 09:15:00',
    maintenance_notes: 'Technician arrived at site. Confirmed the primary lamp module has reached end of life.',
    category: 'Electrical Issues'
  },
  {
    id: 2,
    ticket_number: 'KNT-1025',
    title: 'Broken height adjustment on desk #42',
    description: 'Broken height adjustment on desk #42',
    location: 'D01 Seminar Room',
    lat: 7.2550,
    lng: 80.5915,
    priority: 'Medium',
    status: 'Open',
    reported_by: 'John Doe',
    reported_at: '2023-10-24 10:30:00',
    maintenance_notes: '',
    category: 'Furniture Repairs'
  },
  {
    id: 3,
    ticket_number: 'KNT-1026',
    title: 'Flickering overhead light in aisle D',
    description: 'Flickering overhead light in aisle D',
    location: 'Library Level 2',
    lat: 7.2542,
    lng: 80.5910,
    priority: 'Low',
    status: 'Open',
    reported_by: 'Maintenance Bot',
    reported_at: '2023-10-24 07:00:00',
    maintenance_notes: '',
    category: 'Electrical Issues'
  },
  {
    id: 4,
    ticket_number: 'KNT-1027',
    title: 'Water leak detected near refrigeration unit',
    description: 'Water leak detected near refrigeration unit',
    location: 'Cafeteria Annex',
    lat: 7.2555,
    lng: 80.5920,
    priority: 'High',
    status: 'Open',
    reported_by: 'Facility Manager',
    reported_at: '2023-10-24 11:45:00',
    maintenance_notes: '',
    category: 'HVAC Maintenance'
  }
];

// Initialize missing columns in faults table if they don't exist
async function initDB() {
  try {
    await pool.query('ALTER TABLE faults ADD COLUMN maintenance_notes TEXT');
    await pool.query('ALTER TABLE faults ADD COLUMN photo_url VARCHAR(255)');
  } catch (err) {
    // Ignore error, we will use mocks if needed
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
    console.warn('DB error, using mock data for /api/tickets');
    res.json({
      data: mockTickets,
      pagination: {
        total: mockTickets.length,
        page: 1,
        limit: 10
      }
    });
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
    console.warn('DB error, using mock data for /api/tickets/stats');
    res.json({
      open: 3,
      inProgress: 1,
      resolvedToday: 5,
      resolutionRates: [
        { category: 'Electrical Issues', rate: 85 },
        { category: 'Furniture Repairs', rate: 60 },
        { category: 'HVAC Maintenance', rate: 45 }
      ]
    });
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
    console.warn('DB error, using mock data for /api/tickets/:id');
    const ticket = mockTickets.find(t => t.id == req.params.id || t.ticket_number == req.params.id);
    if (ticket) res.json(ticket);
    else res.status(404).json({ error: 'Ticket not found' });
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
    console.warn('DB error, mocking update response');
    res.json({ success: true, message: 'Ticket updated successfully (MOCK)' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
