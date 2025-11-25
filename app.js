/* app.js (Reson API) */
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
const port = 4000; // or any port you prefer

const userRoutes = require('./user');
const employerRoutes = require('./employer');
const jobRoutes = require('./jobs');
const candidateRoutes = require('./candidate');
const jobResultRoutes = require('./job_result');
const questionRoutes = require('./question');
const answerRoutes = require('./answer');
const companyRoutes = require('./company');

app.use(cors());

// Use the user and employer routes
// --- Basic checks ---
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Optional: eine kleine Root-Antwort statt 404
app.get('/', (req, res) => res.json({ name: 'Reson API', ok: true }));
app.use('/user_accounts', userRoutes);
app.use('/employers', employerRoutes);
app.use('/jobs', jobRoutes);
app.use('/candidate', candidateRoutes);
app.use('/job_result', jobResultRoutes);
app.use('/question', questionRoutes);
app.use('/answer', answerRoutes);
app.use('/company', companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
