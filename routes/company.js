const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateIdParam, isValidEmail } = require('../utils/validation');

router.use(express.json());

// Get all companies
router.get('/', (req, res) => {
    db.query('SELECT * FROM company', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get a specific company
router.get('/:company_id', (req, res) => {
    const companyId = validateIdParam(req.params.company_id);
    if (!companyId) {
        return res.status(400).json({ error: 'Invalid company ID' });
    }
    db.query('SELECT * FROM company WHERE company_id = ?', [companyId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Company not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Get companies based on user_id
router.get('/user/:user_id', (req, res) => {
    const userId = validateIdParam(req.params.user_id);
    if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    db.query('SELECT * FROM company WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new company
router.post('/', (req, res) => {
    const { company_name, user_id, company_website, company_email_address, company_logo, company_logo_key, company_s3folder, company_description, company_team_size, company_stage, company_address, company_country, company_values, company_working_environment, company_growth, company_diversity, company_vision, company_ceo_video_url, company_ceo_video_key } = req.body;

    // Validate required fields
    if (!company_name || !user_id) {
        return res.status(400).json({ error: 'Company name and user ID are required' });
    }

    // Validate email format if provided
    if (company_email_address && !isValidEmail(company_email_address)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const newCompany = {
        user_id,
        company_name,
        company_website,
        company_email_address,
        company_logo,
        company_logo_key,
        company_s3folder,
        company_description,
        company_team_size,
        company_stage,
        company_ceo_video_url,
        company_ceo_video_key,
        company_address,
        company_country,
        company_values,
        company_working_environment,
        company_growth,
        company_diversity,
        company_vision,
        created_date: new Date(),
        last_modified_date: new Date()
    };

    db.query('INSERT INTO company SET ?', newCompany, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.status(201).json({ message: 'Company created successfully', company_id: result.insertId });
        }
    });
});

// Update a company
router.put('/:company_id', (req, res) => {
    const companyId = validateIdParam(req.params.company_id);
    if (!companyId) {
        return res.status(400).json({ error: 'Invalid company ID' });
    }
    const { company_name, user_id, company_website, company_email_address, company_logo, company_logo_key, company_s3folder, company_description, company_team_size, company_stage, company_address, company_country, company_values, company_working_environment, company_growth, company_diversity, company_vision, company_ceo_video_url, company_ceo_video_key } = req.body;

    // Validate email format if provided
    if (company_email_address && !isValidEmail(company_email_address)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const updatedCompany = {
        user_id,
        company_name,
        company_website,
        company_email_address,
        company_logo,
        company_logo_key,
        company_s3folder,
        company_description,
        company_ceo_video_url,
        company_ceo_video_key,
        company_team_size,
        company_stage,
        company_address,
        company_country,
        company_values,
        company_working_environment,
        company_growth,
        company_diversity,
        company_vision,
        last_modified_date: new Date()
    };

    db.query('UPDATE company SET ? WHERE company_id = ?', [updatedCompany, companyId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Company not found' });
        } else {
            res.json({ message: 'Company updated successfully' });
        }
    });
});

// Delete a company
router.delete('/:company_id', (req, res) => {
    const companyId = validateIdParam(req.params.company_id);
    if (!companyId) {
        return res.status(400).json({ error: 'Invalid company ID' });
    }

    db.query('DELETE FROM company WHERE company_id = ?', [companyId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Company not found' });
        } else {
            res.json({ message: 'Company deleted successfully' });
        }
    });
});

module.exports = router;

