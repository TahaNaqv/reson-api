const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateIdParam, isValidId } = require('../utils/validation');

router.use(express.json());

// Get all answers
router.get('/', (req, res) => {
  db.query('SELECT * FROM answer_table', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Get answers from a particular candidate
router.get('/candidate/:candidate_id', (req, res) => {
  const candidateId = validateIdParam(req.params.candidate_id);
  if (!candidateId) {
    return res.status(400).json({ error: 'Invalid candidate ID' });
  }
  db.query('SELECT * FROM answer_table WHERE candidate_id = ?', [candidateId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Get answers from a particular candidate for a particular job
router.get('/candidate/:candidate_id/job/:job_id', (req, res) => {
  const candidateId = validateIdParam(req.params.candidate_id);
  const jobId = validateIdParam(req.params.job_id);
  if (!candidateId || !jobId) {
    return res.status(400).json({ error: 'Invalid candidate ID or job ID' });
  }
  db.query('SELECT * FROM answer_table WHERE candidate_id = ? AND job_id = ?', [candidateId, jobId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Get answers for a specific question
router.get('/question/:question_id', (req, res) => {
  const questionId = validateIdParam(req.params.question_id);
  if (!questionId) {
    return res.status(400).json({ error: 'Invalid question ID' });
  }
  db.query('SELECT * FROM answer_table WHERE question_id = ?', [questionId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Get all answers for a specific job
router.get('/job/:job_id', (req, res) => {
  const jobId = validateIdParam(req.params.job_id);
  if (!jobId) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }
  db.query('SELECT * FROM answer_table WHERE job_id = ?', [jobId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Get a specific answer
router.get('/:answer_id', (req, res) => {
  const answerId = validateIdParam(req.params.answer_id);
  if (!answerId) {
    return res.status(400).json({ error: 'Invalid answer ID' });
  }
  db.query('SELECT * FROM answer_table WHERE answer_id = ?', [answerId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'Answer not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Create a new answer
router.post('/', (req, res) => {
  const { candidate_id, question_id, job_id, answer_url, answer_title, answer_key, job_s3_folder, answer_transcript } = req.body;

  if (!candidate_id || !answer_url || !answer_title || !answer_key || !job_s3_folder) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate ID fields
  if (!isValidId(candidate_id)) {
    return res.status(400).json({ error: 'Invalid candidate ID' });
  }
  if (question_id && !isValidId(question_id)) {
    return res.status(400).json({ error: 'Invalid question ID' });
  }
  if (job_id && !isValidId(job_id)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  const newAnswer = {
    candidate_id,
    question_id,
    job_id,
    answer_url,
    answer_title,
    answer_key,
    job_s3_folder,
    answer_transcript,
    created_date: new Date(),
  };

  db.query('INSERT INTO answer_table SET ?', newAnswer, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else {
      res.status(201).json({ message: 'Answer created successfully', answer_id: result.insertId });
    }
  });
});

// Update an answer
router.put('/:answer_id', (req, res) => {
  const answerId = validateIdParam(req.params.answer_id);
  if (!answerId) {
    return res.status(400).json({ error: 'Invalid answer ID' });
  }
  const { candidate_id, job_id, question_id, answer_url, answer_title, answer_key, job_s3_folder, answer_transcript } = req.body;

  if (!candidate_id || !answer_url || !answer_title || !answer_key || !job_s3_folder) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const updatedAnswer = {
    candidate_id,
    question_id,
    job_id,
    answer_url,
    answer_title,
    answer_key,
    answer_transcript,
    job_s3_folder
  };

  db.query('UPDATE answer_table SET ? WHERE answer_id = ?', [updatedAnswer, answerId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Answer not found' });
    } else {
      res.json({ message: 'Answer updated successfully' });
    }
  });
});

// Delete an answer
router.delete('/:answer_id', (req, res) => {
  const answerId = validateIdParam(req.params.answer_id);
  if (!answerId) {
    return res.status(400).json({ error: 'Invalid answer ID' });
  }

  db.query('DELETE FROM answer_table WHERE answer_id = ?', [answerId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Answer not found' });
    } else {
      res.json({ message: 'Answer deleted successfully' });
    }
  });
});

module.exports = router;
