const mysql = require('mysql');

// Create a connection pool (better than individual connections)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000, // 60 seconds to acquire connection from pool
    timeout: 60000, // 60 seconds query timeout
    reconnect: true, // Automatically reconnect on connection loss
    idleTimeout: 300000, // Close idle connections after 5 minutes
    enableKeepAlive: true, // Keep connections alive
    keepAliveInitialDelay: 0 // Start keep-alive immediately
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Database pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost. Pool will attempt to reconnect.');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Database connection refused. Check database server status.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('Database access denied. Check credentials.');
    } else {
        console.error('Unexpected database pool error:', err);
    }
});

// Monitor pool events (for debugging and monitoring)
if (process.env.NODE_ENV !== 'production') {
    pool.on('connection', (connection) => {
        console.log('New database connection established');
    });

    pool.on('acquire', (connection) => {
        console.log('Connection acquired from pool');
    });

    pool.on('release', (connection) => {
        console.log('Connection released back to pool');
    });
}

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        console.error('Connection details:', {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME,
            user: process.env.DB_USER
        });
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

module.exports = pool;
