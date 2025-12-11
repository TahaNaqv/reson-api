const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateIdParam, isValidId } = require('../utils/validation');

router.use(express.json());

// Get all questions for a specific job
router.get('/job/:job_id', (req, res) => {
    const jobId = validateIdParam(req.params.job_id);
    if (!jobId) {
        return res.status(400).json({ error: 'Invalid job ID' });
    }
    db.query('SELECT * FROM question_table WHERE job_id = ?', [jobId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get a specific question
router.get('/:question_id', (req, res) => {
    const questionId = validateIdParam(req.params.question_id);
    if (!questionId) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }
    db.query('SELECT * FROM question_table WHERE question_id = ?', [questionId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Question not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new question for a specific job
router.post('/', (req, res) => {
    const { question_key, job_id, job_s3_folder, question_title, question_video_url, question_transcript } = req.body;

    if (!question_key || !job_id || !job_s3_folder || !question_title || !question_video_url) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate job_id
    if (!isValidId(job_id)) {
        return res.status(400).json({ error: 'Invalid job ID' });
    }

    const newQuestion = {
        job_id,
        question_title,
        question_key,
        job_s3_folder,
        question_video_url,
        question_transcript,
        created_date: new Date()
    };

    db.query('INSERT INTO question_table SET ?', newQuestion, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.status(201).json({ message: 'Question created successfully', question_id: result.insertId });
        }
    });
});

// Update a question
router.put('/:question_id', (req, res) => {
    const questionId = validateIdParam(req.params.question_id);
    if (!questionId) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }
    const { question_key, job_s3_folder, question_title, question_video_url, question_transcript } = req.body;

    if (!question_key || !job_s3_folder || !question_title || !question_video_url) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedQuestion = {
        question_key,
        question_transcript,
        job_s3_folder,
        question_title,
        question_video_url
        // Note: created_date is not updated to preserve original creation date
    };

    db.query('UPDATE question_table SET ? WHERE question_id = ?', [updatedQuestion, questionId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Question not found' });
        } else {
            res.json({ message: 'Question updated successfully' });
        }
    });
});

// Delete a question
router.delete('/:question_id', (req, res) => {
    const questionId = validateIdParam(req.params.question_id);
    if (!questionId) {
        return res.status(400).json({ error: 'Invalid question ID' });
    }

    db.query('DELETE FROM question_table WHERE question_id = ?', [questionId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Question not found' });
        } else {
            res.json({ message: 'Question deleted successfully' });
        }
    });
});

module.exports = router;
