const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

router.use(express.json());

// Get all job interactions
router.get('/', (req, res) => {
    db.query('SELECT * FROM job_result', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results);
        }
    });
});

// Get all results for specific job_id
router.get('/job/:job_id', (req, res) => {
    const jobId = req.params.job_id;
    db.query('SELECT * FROM job_result WHERE job_id = ?', [jobId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (results.length === 0) {
            res.json({"response": "Job result not found"});
        } else {
            res.json(results);
        }
    });
});

// Get candidate's status for a particular job id
router.get('/jobId/:job_id/candidateId/:candidate_id', (req, res) => {
    const jobId = req.params.job_id;
    const candidateId = req.params.candidate_id;
    db.query('SELECT * FROM job_result WHERE candidate_id = ? AND job_id = ?', [candidateId, jobId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (results.length === 0) {
            res.json({"status": "false", "response": "Job result not found"});
        } else {
            res.json(results);
        }
    });
});

// Get all results for specific job_id
router.get('/candidate/:candidate_id', (req, res) => {
    const candidateId = req.params.candidate_id;
    db.query('SELECT * FROM job_result WHERE candidate_id = ?', [candidateId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (results.length === 0) {
            res.json({"response": "Job result not found"});
        } else {
            res.json(results[0]);
        }
    });
});

// Get a specific job interaction
router.get('/:interaction_id', (req, res) => {
    const interactionId = req.params.interaction_id;
    db.query('SELECT * FROM job_result WHERE interaction_id = ?', [interactionId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (results.length === 0) {
            res.status(404).send('Job result not found');
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
            res.status(500).send('Internal Server Error');
        } else {
            res.status(201).json({ message: 'Job result created successfully', interaction_id: result.insertId });
        }
    });
});

// Update a job interaction
router.put('/:interaction_id', (req, res) => {
    const interactionId = req.params.interaction_id;
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
            res.status(500).send('Internal Server Error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Job result not found');
        } else {
            res.json({ message: 'Job result updated successfully' });
        }
    });
});

// Delete a job interaction
router.delete('/:interaction_id', (req, res) => {
    const interactionId = req.params.interaction_id;

    db.query('DELETE FROM job_result WHERE interaction_id = ?', [interactionId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Job result not found');
        } else {
            res.json({ message: 'Job result deleted successfully' });
        }
    });
});

module.exports = router;
