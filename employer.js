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

// Get all employers
router.get('/', (req, res) => {
    db.query('SELECT * FROM employer_details', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results);
        }
    });
});

// Get a specific employer
router.get('/:employer_id', (req, res) => {
    const employerId = req.params.employer_id;
    db.query('SELECT * FROM employer_details WHERE employer_id = ?', [employerId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (results.length === 0) {
            res.status(404).send('Employer not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new employer
router.post('/', (req, res) => {
    const { user_id, employer_first_name, employer_last_name, employer_profile_picture, employer_img_key, employer_s3_folder, employer_dob, employer_gender, employer_email_address, employer_role, employer_social, company_id, company_name, company_address, type_of_company } = req.body;

    if (!user_id || !employer_first_name || !employer_last_name || !employer_email_address || !company_id || !company_name || !company_address || !type_of_company) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const newEmployer = {
        user_id,
        employer_first_name,
        employer_last_name,
        employer_profile_picture,
        employer_img_key,
        employer_s3_folder,
        employer_dob,
        employer_gender,
        employer_email_address,
        employer_role,
        employer_social,
        company_id,
        company_name,
        company_address,
        type_of_company,
        created_date: new Date(),
        date_updated: new Date()
    };

    db.query('INSERT INTO employer_details SET ?', newEmployer, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(201).json({ message: 'Employer created successfully', employer_id: result.insertId });
        }
    });
});

// Update an employer
router.put('/:employer_id', (req, res) => {
    const employerId = req.params.employer_id;
    const { user_id, employer_first_name, employer_last_name, employer_profile_picture, employer_img_key, employer_s3_folder, employer_dob, employer_gender, employer_email_address, employer_role, employer_social, company_id, company_name, company_address, type_of_company } = req.body;

    if (!user_id || !employer_first_name || !employer_last_name || !employer_email_address || !company_id || !company_name || !company_address || !type_of_company) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const updatedEmployer = {
        user_id,
        employer_first_name,
        employer_last_name,
        employer_profile_picture,
        employer_img_key,
        employer_s3_folder,
        employer_dob,
        employer_gender,
        employer_email_address,
        employer_role,
        employer_social,
        company_id,
        company_name,
        company_address,
        type_of_company,
        date_updated: new Date()
    };

    db.query('UPDATE employer_details SET ? WHERE employer_id = ?', [updatedEmployer, employerId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Employer not found');
        } else {
            res.json({ message: 'Employer updated successfully' });
        }
    });
});

// Delete an employer
router.delete('/:employer_id', (req, res) => {
    const employerId = req.params.employer_id;

    db.query('DELETE FROM employer_details WHERE employer_id = ?', [employerId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Employer not found');
        } else {
            res.json({ message: 'Employer deleted successfully' });
        }
    });
});

module.exports = router;
