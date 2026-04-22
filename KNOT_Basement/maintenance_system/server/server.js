const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data for demonstration purposes
let tickets = [
  {
    id: 1,
    ticket_number: 'KNT-1024',
    title: 'Projector lamp failure in AV system',
    description: 'Projector lamp failure in AV system',
    location: 'EOE Hall - Main Entrance',
    priority: 'High',
    status: 'In Progress',
    reported_by: 'Prof. Sarah Jenkins',
    reported_at: '2023-10-24T09:15:00',
    maintenance_notes: 'Technician arrived at site. Confirmed the primary lamp module has reached end of life. Attempted a reset but hardware failure persists. Spare lamp (Model-X400) has been requested from inventory. Estimated replacement time: 20 mins once part arrives.',
    category: 'Electrical Issues',
    photo_url: 'https://images.unsplash.com/photo-1544890225-2f3faec4cb60?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80'
  },
  {
    id: 2,
    ticket_number: 'KNT-1025',
    title: 'Broken height adjustment on desk #42',
    description: 'Broken height adjustment on desk #42',
    location: 'D01 Seminar Room',
    priority: 'Medium',
    status: 'Open',
    reported_by: 'John Doe',
    reported_at: '2023-10-24T10:30:00',
    maintenance_notes: '',
    category: 'Furniture Repairs'
  },
  {
    id: 3,
    ticket_number: 'KNT-1026',
    title: 'Flickering overhead light in aisle D',
    description: 'Flickering overhead light in aisle D',
    location: 'Library Level 2',
    priority: 'Low',
    status: 'Resolved',
    reported_by: 'Maintenance Bot',
    reported_at: '2023-10-24T07:00:00',
    maintenance_notes: 'Replaced bulb.',
    category: 'Electrical Issues'
  },
  {
    id: 4,
    ticket_number: 'KNT-1027',
    title: 'Water leak detected near refrigeration unit',
    description: 'Water leak detected near refrigeration unit',
    location: 'Cafeteria Annex',
    priority: 'High',
    status: 'Open',
    reported_by: 'Facility Manager',
    reported_at: '2023-10-24T11:45:00',
    maintenance_notes: '',
    category: 'HVAC Maintenance'
  }
];

// Get all active tickets (with optional search and filter)
app.get('/api/tickets', (req, res) => {
  try {
    const { search, priority, status, page = 1, limit = 10 } = req.query;
    
    let filteredTickets = [...tickets];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = filteredTickets.filter(t => 
        t.location.toLowerCase().includes(searchLower) || 
        t.title.toLowerCase().includes(searchLower) || 
        t.ticket_number.toLowerCase().includes(searchLower)
      );
    }

    if (priority) {
      filteredTickets = filteredTickets.filter(t => t.priority === priority);
    }

    if (status) {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }

    // Sort by reported_at desc
    filteredTickets.sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedTickets = filteredTickets.slice(offset, offset + Number(limit));

    res.json({
      data: paginatedTickets,
      pagination: {
        total: filteredTickets.length,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Server error fetching tickets' });
  }
});

// Get ticket statistics
app.get('/api/tickets/stats', (req, res) => {
  try {
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const resolvedToday = tickets.filter(t => t.status === 'Resolved').length;
    
    const stats = {
      open,
      inProgress,
      resolvedToday,
      resolutionRates: [
        { category: 'Electrical Issues', rate: 85 },
        { category: 'Furniture Repairs', rate: 60 },
        { category: 'HVAC Maintenance', rate: 45 }
      ]
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// Get a specific ticket
app.get('/api/tickets/:id', (req, res) => {
  try {
    const ticket = tickets.find(t => t.id.toString() === req.params.id || t.ticket_number === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Server error fetching ticket' });
  }
});

// Update a ticket
app.put('/api/tickets/:id', (req, res) => {
  try {
    const { status, maintenance_notes, photo_url } = req.body;
    
    const ticketIndex = tickets.findIndex(t => t.id.toString() === req.params.id || t.ticket_number === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const updatedTicket = { ...tickets[ticketIndex] };
    
    if (status) updatedTicket.status = status;
    if (maintenance_notes !== undefined) updatedTicket.maintenance_notes = maintenance_notes;
    if (photo_url !== undefined) updatedTicket.photo_url = photo_url;
    
    tickets[ticketIndex] = updatedTicket;
    
    res.json({ success: true, message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Server error updating ticket' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
