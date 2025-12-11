const db = require('../config/database');

/**
 * Execute a series of database operations within a transaction
 * 
 * @param {Function} operations - Async function that receives a connection and performs operations
 * @returns {Promise} - Resolves with the result of the operations, or rejects with an error
 * 
 * @example
 * await executeTransaction(async (connection) => {
 *   const result1 = await query(connection, 'INSERT INTO table1 SET ?', [data1]);
 *   const result2 = await query(connection, 'INSERT INTO table2 SET ?', [data2]);
 *   return { result1, result2 };
 * });
 */
function executeTransaction(operations) {
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection for transaction:', err);
                return reject(err);
            }

            // Start transaction
            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    console.error('Error beginning transaction:', err);
                    return reject(err);
                }

                // Promisify query function for use within transaction
                const query = (sql, params) => {
                    return new Promise((resolveQuery, rejectQuery) => {
                        connection.query(sql, params, (err, results) => {
                            if (err) {
                                return rejectQuery(err);
                            }
                            resolveQuery(results);
                        });
                    });
                };

                // Execute operations
                Promise.resolve(operations(query, connection))
                    .then((result) => {
                        // Commit transaction
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Error committing transaction:', err);
                                    reject(err);
                                });
                            }
                            connection.release();
                            resolve(result);
                        });
                    })
                    .catch((error) => {
                        // Rollback transaction on error
                        connection.rollback(() => {
                            connection.release();
                            console.error('Transaction rolled back due to error:', error);
                            reject(error);
                        });
                    });
            });
        });
    });
}

/**
 * Promisified query function for use outside transactions
 * 
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with query results
 */
function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

module.exports = {
    executeTransaction,
    query
};
