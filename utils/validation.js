/**
 * Validation utility functions for input validation
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate that a value is a valid integer ID
 * @param {any} id - Value to validate
 * @returns {boolean} - True if valid integer ID, false otherwise
 */
function isValidId(id) {
    if (id === null || id === undefined) {
        return false;
    }
    // Convert to number and check if it's a positive integer
    const numId = Number(id);
    return Number.isInteger(numId) && numId > 0;
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length (inclusive)
 * @param {number} maxLength - Maximum length (inclusive)
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidLength(str, minLength = 0, maxLength = Infinity) {
    if (str === null || str === undefined) {
        return minLength === 0;
    }
    if (typeof str !== 'string') {
        return false;
    }
    const length = str.trim().length;
    return length >= minLength && length <= maxLength;
}

/**
 * Validate required fields are present
 * @param {Object} data - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, missing: Array<string> }
 */
function validateRequiredFields(data, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missing.push(field);
        }
    }
    return {
        valid: missing.length === 0,
        missing
    };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {Object} - { valid: boolean, message: string }
 */
function validatePassword(password, minLength = 6) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }
    if (password.length < minLength) {
        return { valid: false, message: `Password must be at least ${minLength} characters long` };
    }
    return { valid: true, message: 'Password is valid' };
}

/**
 * Sanitize and validate ID parameter from URL
 * @param {string} idParam - ID parameter from request
 * @returns {number|null} - Validated ID as number, or null if invalid
 */
function validateIdParam(idParam) {
    if (!idParam) {
        return null;
    }
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }
    return id;
}

module.exports = {
    isValidEmail,
    isValidId,
    isValidLength,
    validateRequiredFields,
    validatePassword,
    validateIdParam
};
