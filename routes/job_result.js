const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateIdParam, isValidId } = require('../utils/validation');

router.use(express.json());

// Get all job interactions
router.get('/', (req, res) => {
    db.query('SELECT * FROM job_result', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get all results for specific job_id
router.get('/job/:job_id', (req, res) => {
    const jobId = validateIdParam(req.params.job_id);
    if (!jobId) {
        return res.status(400).json({ error: 'Invalid job ID' });
    }
    db.query('SELECT * FROM job_result WHERE job_id = ?', [jobId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Job result not found' });
        } else {
            res.json(results);
        }
    });
});

// Get candidate's status for a particular job id
router.get('/jobId/:job_id/candidateId/:candidate_id', (req, res) => {
    const jobId = validateIdParam(req.params.job_id);
    const candidateId = validateIdParam(req.params.candidate_id);
    if (!jobId || !candidateId) {
        return res.status(400).json({ error: 'Invalid job ID or candidate ID' });
    }
    db.query('SELECT * FROM job_result WHERE candidate_id = ? AND job_id = ?', [candidateId, jobId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Job result not found' });
        } else {
            res.json(results);
        }
    });
});

// Get all results for specific candidate_id
router.get('/candidate/:candidate_id', (req, res) => {
    const candidateId = validateIdParam(req.params.candidate_id);
    if (!candidateId) {
        return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    db.query('SELECT * FROM job_result WHERE candidate_id = ?', [candidateId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Job result not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Get a specific job interaction
router.get('/:interaction_id', (req, res) => {
    const interactionId = validateIdParam(req.params.interaction_id);
    if (!interactionId) {
        return res.status(400).json({ error: 'Invalid interaction ID' });
    }
    db.query('SELECT * FROM job_result WHERE interaction_id = ?', [interactionId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Job result not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new job interaction
router.post('/', (req, res) => {
    const { candidate_id, job_id, status, ai_output } = req.body;

    if (!candidate_id || !job_id || !status || !ai_output) {
        return res.status(400).json({ error: 'Candidate ID, Job ID, and Status are required fields' });
    }

    // Validate ID fields
    if (!isValidId(candidate_id)) {
        return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    if (!isValidId(job_id)) {
        return res.status(400).json({ error: 'Invalid job ID' });
    }

    const newInteraction = {
        candidate_id,
        job_id,
        status,
        ai_output,
        created_date: new Date(),
        date_updated: new Date()
    };

    db.query('INSERT INTO job_result SET ?', newInteraction, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.status(201).json({ message: 'Job result created successfully', interaction_id: result.insertId });
        }
    });
});

// Update a job interaction
router.put('/:interaction_id', (req, res) => {
    const interactionId = validateIdParam(req.params.interaction_id);
    if (!interactionId) {
        return res.status(400).json({ error: 'Invalid interaction ID' });
    }
    const { status, ai_output} = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is a required field' });
    }

    const updatedInteraction = {
        status,
        ai_output,
        date_updated: new Date()
    };

    db.query('UPDATE job_result SET ? WHERE interaction_id = ?', [updatedInteraction, interactionId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Job result not found' });
        } else {
            res.json({ message: 'Job result updated successfully' });
        }
    });
});

// Delete a job interaction
router.delete('/:interaction_id', (req, res) => {
    const interactionId = validateIdParam(req.params.interaction_id);
    if (!interactionId) {
        return res.status(400).json({ error: 'Invalid interaction ID' });
    }

    db.query('DELETE FROM job_result WHERE interaction_id = ?', [interactionId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Job result not found' });
        } else {
            res.json({ message: 'Job result deleted successfully' });
        }
    });
});

module.exports = router;
