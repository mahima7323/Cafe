const mysql = require('mysql2');
require('dotenv').config();

// Create the connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mahimathaker@7323',
    database: process.env.DB_NAME || 'cafeapp'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database!');
});

module.exports = db;
