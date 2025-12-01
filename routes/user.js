// user.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Middleware to parse JSON in the request body
router.use(express.json());

// Get all user accounts
router.get('/', (req, res) => {
    db.query('SELECT * FROM user_account', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Login route (must be before /:user_id to avoid route conflicts)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.query('SELECT * FROM user_account WHERE user_email_address = ?', [email], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            return res.status(401).json({ status: 'false', message: 'Invalid email or password' });
        } else {
            const hashedPassword = results[0].password;

            // Compare the hashed password with the plaintext password using bcrypt
            bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
                }

                if (isMatch) {
                    res.json({ user: results[0], status: 'true', message: 'Login successful' });
                } else {
                    return res.status(401).json({ status: 'false', message: 'Invalid email or password' });
                }
            });
        }
    });
});

// Get a specific user account
router.get('/:user_id', (req, res) => {
    const userId = req.params.user_id;
    db.query('SELECT * FROM user_account WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(200).json({ status: 'false', message: 'User account not found' });
        } else {
            res.json({ user: results[0], status: 'true', message: 'User retrieved successfully' });
        }
    });
});

router.post('/', (req, res) => {
    const { user_email_address, user_name, password } = req.body;

    console.log("--- register user", user_email_address, user_name);
    if (!user_email_address || !user_name || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email is already in use
    db.query('SELECT * FROM user_account WHERE user_email_address = ?', [user_email_address], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        } else if (results.length === 1 || results.length >= 1) {
            return res.status(400).json({ 'message': 'Email address already exists' });
        } else {
            // Hash the password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
                }

                const newUser = {
                    user_name,
                    user_email_address,
                    password: hashedPassword,
                    role: 'recruiter',
                    created_date: new Date(),
                    last_modified_date: null // Set last_modified_date to null here
                };

                db.query('INSERT INTO user_account SET ?', newUser, (err, result) => {
                    if (err) {
                        // Check if the error is due to duplicate email address
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ error: 'Email address already exists' });
                        } else {
                            console.error('Error executing query:', err);
                            return res.status(500).json({ message: 'Internal Server Error', error: err.message });
                        }
                    } else {
                        res.status(201).json({ message: 'User account created successfully', user_id: result.insertId });
                    }
                });
            });
        }
    })

});



router.put('/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const { user_email_address, user_name, password, role } = req.body;

    if (!user_email_address || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedUser = {
        user_email_address,
        user_name,
        password,
        role,
        last_modified_date: new Date()
    };

    db.query('UPDATE user_account SET ? WHERE user_id = ?', [updatedUser, userId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User account not found' });
        } else {
            res.json({ message: 'User account updated successfully' });
        }
    });
});

// Delete a user account
router.delete('/:user_id', (req, res) => {
    const userId = req.params.user_id;

    db.query('DELETE FROM user_account WHERE user_id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User account not found' });
        } else {
            res.json({ message: 'User account deleted successfully' });
        }
    });
});

module.exports = router;

