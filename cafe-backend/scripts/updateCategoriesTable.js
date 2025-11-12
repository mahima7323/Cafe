const db = require('../config/db');

const updateTable = () => {
    const sql = `
        ALTER TABLE categories 
        ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'
    `;

    db.query(sql, (err) => {
        if (err) {
            console.error('Error updating table:', err);
        } else {
            console.log('Categories table updated with status field');
        }
        process.exit();
    });
};

updateTable();