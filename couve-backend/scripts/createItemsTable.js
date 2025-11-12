const db = require('../config/db');

const createItemsTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            subcategory_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image VARCHAR(255),
            status ENUM('available', 'unavailable') DEFAULT 'available',
            is_deleted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
        )`;

    db.query(sql, (err) => {
        if (err) {
            console.error('Error creating items table:', err);
        } else {
            console.log('Items table created/exists');
        }
        process.exit();
    });
};

createItemsTable();


