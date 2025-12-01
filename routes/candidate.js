const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.use(express.json());

// Get all candidates
router.get('/', (req, res) => {
    db.query('SELECT * FROM candidate_details', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get a specific candidate
router.get('/:candidate_id', (req, res) => {
    const candidateId = req.params.candidate_id;
    db.query('SELECT * FROM candidate_details WHERE candidate_id = ?', [candidateId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Candidate not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Check if candidate exists using the email address
router.get('/email/:candidate_email_address', (req, res) => {
    const candidateEmail = req.params.candidate_email_address;
    db.query('SELECT * FROM candidate_details WHERE candidate_email_address = ?', [candidateEmail], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Candidate email not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new candidate
router.post('/', (req, res) => {
    const { candidate_first_name, candidate_last_name, candidate_profile_image, candidate_img_key, candidate_s3_folder, candidate_dob, candidate_email_address, skills } = req.body;

    if ( !candidate_first_name || !candidate_last_name || !candidate_profile_image || !candidate_img_key || !candidate_s3_folder || !candidate_dob || !candidate_email_address || !skills ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newCandidate = {
        candidate_first_name,
        candidate_last_name,
        candidate_profile_image,
        candidate_img_key,
        candidate_s3_folder,
        candidate_dob,
        candidate_email_address,
        skills,
        created_date: new Date(),
        date_updated: new Date()
    };

    db.query('INSERT INTO candidate_details SET ?', newCandidate, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.status(201).json({ message: 'Candidate created successfully', candidate_id: result.insertId });
        }
    });
});

// Update a candidate
router.put('/:candidate_id', (req, res) => {
    const candidateId = req.params.candidate_id;
    const { candidate_first_name, candidate_last_name, candidate_profile_image, candidate_img_key, candidate_s3_folder, candidate_dob, candidate_email_address, skills } = req.body;

    if ( !candidate_first_name || !candidate_last_name || !candidate_profile_image || !candidate_img_key || !candidate_s3_folder || !candidate_dob || !candidate_email_address || !skills ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedCandidate = {
        candidate_first_name,
        candidate_last_name,
        candidate_profile_image,
        candidate_img_key,
        candidate_s3_folder,
        candidate_dob,
        candidate_email_address,
        skills,
        date_updated: new Date()
    };

    db.query('UPDATE candidate_details SET ? WHERE candidate_id = ?', [updatedCandidate, candidateId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Candidate not found' });
        } else {
            res.json({ message: 'Candidate updated successfully' });
        }
    });
});

// Delete a candidate
router.delete('/:candidate_id', (req, res) => {
    const candidateId = req.params.candidate_id;

    db.query('DELETE FROM candidate_details WHERE candidate_id = ?', [candidateId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Candidate not found' });
        } else {
            res.json({ message: 'Candidate deleted successfully' });
        }
    });
});

module.exports = router;
