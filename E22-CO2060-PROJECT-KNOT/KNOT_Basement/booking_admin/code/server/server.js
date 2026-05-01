const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('KNOT API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
