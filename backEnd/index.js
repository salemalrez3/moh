require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/user');
const verifyRoutes = require('./routes/ver');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/verify', verifyRoutes);
app.use('/stats', statsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});