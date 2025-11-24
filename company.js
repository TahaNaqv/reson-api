const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
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

// Get all companies
router.get('/', (req, res) => {
    db.query('SELECT * FROM company', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results);
        }
    });
});

// Get a specific company
router.get('/:company_id', (req, res) => {
    const companyId = req.params.company_id;
    db.query('SELECT * FROM company WHERE company_id = ?', [companyId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (results.length === 0) {
            res.status(404).send('Company not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Get companies based on user_id
router.get('/user/:user_id', (req, res) => {
    const userId = req.params.user_id;
    db.query('SELECT * FROM company WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new company
router.post('/', (req, res) => {
    const { company_name, user_id, company_website, company_email_address, company_logo, company_logo_key, company_s3folder, company_description, company_team_size, company_stage, company_address, company_country, company_values, company_working_environment, company_growth, company_diversity, company_vision, company_ceo_video_url, company_ceo_video_key } = req.body;

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
            res.status(500).send('Internal Server Error');
        } else {
            res.status(201).json({ message: 'Company created successfully', company_id: result.insertId });
        }
    });
});

// Update a company
router.put('/:company_id', (req, res) => {
    const companyId = req.params.company_id;
    const { company_name, user_id, company_website, company_email_address, company_logo, company_logo_key, company_s3folder, company_description, company_team_size, company_stage, company_address, company_country, company_values, company_working_environment, company_growth, company_diversity, company_vision, company_ceo_video_url, company_ceo_video_key } = req.body;

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
            res.status(500).send('Internal Server Error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Company not found');
        } else {
            res.json({ message: 'Company updated successfully' });
        }
    });
});

// Delete a company
router.delete('/:company_id', (req, res) => {
    const companyId = req.params.company_id;

    db.query('DELETE FROM company WHERE company_id = ?', [companyId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Company not found');
        } else {
            res.json({ message: 'Company deleted successfully' });
        }
    });
});

module.exports = router;

