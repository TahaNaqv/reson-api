const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.use(express.json());

// Get all jobs
router.get('/', (req, res) => {
    db.query('SELECT * FROM job_details', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get a specific job
router.get('/:job_id', (req, res) => {
    const jobId = req.params.job_id;
    db.query('SELECT * FROM job_details WHERE job_id = ?', [jobId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Job not found' });
        } else {
            res.json(results[0]);
        }
    });
});

router.get('/company/:company_id', (req, res) => {
    const userId = req.params.company_id;
    db.query('SELECT * FROM job_details WHERE company_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Create a new job
router.post('/', (req, res) => {
    const { company_id, job_title, job_type, job_category, job_description, job_offerings, job_requirements, job_qualification, job_work_location, job_expire_date } = req.body;

    if (!company_id || !job_title || !job_type || !job_category || !job_description || !job_requirements || !job_qualification || !job_work_location || !job_expire_date || !job_offerings) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newJob = {
        company_id,
        job_title,
        job_type,
        job_category,
        job_description,
        job_offerings,
        created_date: new Date(),
        date_updated: new Date(),
        job_requirements,
        job_qualification,
        job_work_location,
        job_expire_date
    };

    db.query('INSERT INTO job_details SET ?', newJob, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.status(201).json({ message: 'Job created successfully', job_id: result.insertId });
        }
    });
});

// Update a job
router.put('/:job_id', (req, res) => {
    const jobId = req.params.job_id;
    const { company_id, job_title, job_type, job_category, job_description, job_offerings, job_requirements, job_qualification, job_work_location, job_expire_date } = req.body;

    if (!company_id || !job_title || !job_type || !job_category || !job_description || !job_requirements || !job_qualification || !job_work_location || !job_expire_date || !job_offerings) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedJob = {
        company_id,
        job_title,
        job_type,
        job_category,
        job_description,
        job_offerings,
        job_requirements,
        job_qualification,
        job_work_location,
        job_expire_date,
        date_updated: new Date()
    };

    db.query('UPDATE job_details SET ? WHERE job_id = ?', [updatedJob, jobId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Job not found' });
        } else {
            res.json({ message: 'Job updated successfully' });
        }
    });
});

// Delete a job
router.delete('/:job_id', (req, res) => {
    const jobId = req.params.job_id;

    db.query('DELETE FROM job_details WHERE job_id = ?', [jobId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Job not found' });
        } else {
            res.json({ message: 'Job deleted successfully' });
        }
    });
});

module.exports = router;

