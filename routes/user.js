// user.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { executeTransaction } = require('../utils/transactions');
const { isValidEmail, validatePassword, validateIdParam, isValidLength } = require('../utils/validation');

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

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
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
    const userId = validateIdParam(req.params.user_id);
    if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    db.query('SELECT * FROM user_account WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User account not found' });
        } else {
            res.json({ user: results[0], status: 'true', message: 'User retrieved successfully' });
        }
    });
});

router.post('/', async (req, res) => {
    const { user_email_address, user_name, password } = req.body;

    console.log("--- register user", user_email_address, user_name);
    if (!user_email_address || !user_name || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    if (!isValidEmail(user_email_address)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    const passwordValidation = validatePassword(password, 6);
    if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
    }

    // Validate user name length
    if (!isValidLength(user_name, 1, 255)) {
        return res.status(400).json({ error: 'User name must be between 1 and 255 characters' });
    }

    try {
        // Hash the password first (outside transaction)
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });

        // Execute email check and user insert within a transaction
        const result = await executeTransaction(async (query) => {
            // Check if email is already in use
            const existingUsers = await query('SELECT * FROM user_account WHERE user_email_address = ?', [user_email_address]);
            
            if (existingUsers.length > 0) {
                throw new Error('EMAIL_EXISTS');
            }

            // Insert new user
            const newUser = {
                user_name,
                user_email_address,
                password: hashedPassword,
                role: 'recruiter',
                created_date: new Date(),
                last_modified_date: null
            };

            const insertResult = await query('INSERT INTO user_account SET ?', newUser);
            return insertResult;
        });

        res.status(201).json({ message: 'User account created successfully', user_id: result.insertId });
    } catch (error) {
        console.error('Error registering user:', error);
        
        if (error.message === 'EMAIL_EXISTS') {
            return res.status(400).json({ message: 'Email address already exists' });
        } else if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email address already exists' });
        } else {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
});



router.put('/:user_id', (req, res) => {
    const userId = validateIdParam(req.params.user_id);
    if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { user_email_address, user_name, password, role } = req.body;

    if (!user_email_address || !role) {
        return res.status(400).json({ error: 'Email address and role are required' });
    }

    // Validate email format
    if (!isValidEmail(user_email_address)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate user name length if provided
    if (user_name && !isValidLength(user_name, 1, 255)) {
        return res.status(400).json({ error: 'User name must be between 1 and 255 characters' });
    }

    // Build update object with required fields
    const updatedUser = {
        user_email_address,
        user_name: user_name || null,
        role,
        last_modified_date: new Date()
    };

    // If password is provided, hash it before storing
    if (password) {
        // Validate password meets minimum requirements
        const passwordValidation = validatePassword(password, 6);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
            }

            updatedUser.password = hashedPassword;
            performUpdate();
        });
    } else {
        // No password provided, update without password field
        performUpdate();
    }

    function performUpdate() {
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
    }
});

// Delete a user account
router.delete('/:user_id', (req, res) => {
    const userId = validateIdParam(req.params.user_id);
    if (!userId) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

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

