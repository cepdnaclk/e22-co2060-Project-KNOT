const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/admin/stats
// @desc    Get total bookings for today and pending maintenance tasks
router.get('/stats', async (req, res) => {
    try {
        // Query to get total bookings today
        const [bookings] = await db.query(`
            SELECT COUNT(*) AS totalBookings 
            FROM bookings 
            WHERE DATE(booking_date) = CURDATE()
        `);

        // Query to get pending maintenance
        const [maintenance] = await db.query(`
            SELECT COUNT(*) AS pendingMaintenance 
            FROM faults 
            WHERE status IN ('Pending', 'In Progress')
        `);

        res.json({
            totalBookingsToday: bookings[0].totalBookings,
            pendingMaintenance: maintenance[0].pendingMaintenance
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/admin/approvals
// @desc    Get all pending booking requests
router.get('/approvals', async (req, res) => {
    try {
        const [approvals] = await db.query(`
            SELECT 
                b.id, 
                b.purpose, 
                b.booking_date, 
                b.start_time, 
                b.end_time, 
                b.status,
                r.name AS room_name, 
                r.floor,
                u.name AS user_name, 
                u.role, 
                u.endorsement_status
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN users u ON b.user_id = u.id
            WHERE b.status = 'Pending'
            ORDER BY b.booking_date ASC, b.start_time ASC
        `);
        res.json(approvals);
    } catch (err) {
        console.error('Error fetching approvals:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/admin/approvals/:id
// @desc    Approve or reject a booking request
router.put('/approvals/:id', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'Approve' or 'Reject'

    if (!['Approved', 'Rejected'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be Approved or Rejected.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [action, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: `Booking successfully ${action.toLowerCase()}` });
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
