const db = require('../config/db');

const createTables = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS categories (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(sql, (err) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('Tables created successfully');
        }
        process.exit();
    });
};

createTables();