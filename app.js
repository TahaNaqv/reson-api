require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Import routes
const userRoutes = require('./routes/user');
const employerRoutes = require('./routes/employer');
const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidate');
const jobResultRoutes = require('./routes/job_result');
const questionRoutes = require('./routes/question');
const answerRoutes = require('./routes/answer');
const companyRoutes = require('./routes/company');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Root endpoint
app.get('/', (req, res) => res.json({ name: 'Reson API', ok: true }));

// API Routes
app.use('/user_accounts', userRoutes);
app.use('/employers', employerRoutes);
app.use('/jobs', jobRoutes);
app.use('/candidate', candidateRoutes);
app.use('/job_result', jobResultRoutes);
app.use('/question', questionRoutes);
app.use('/answer', answerRoutes);
app.use('/company', companyRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
