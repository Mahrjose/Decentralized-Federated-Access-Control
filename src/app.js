const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const policyRoutes = require('./routes/policyRoutes');

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/policies', policyRoutes);

module.exports = app;
