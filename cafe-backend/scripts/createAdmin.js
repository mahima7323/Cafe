const bcrypt = require('bcryptjs');
const db = require('../config/db');

const createAdmin = async () => {
    const username = 'admin';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin exists
    db.query('SELECT id FROM admin WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error checking admin:', err);
            process.exit(1);
        }

        if (results.length > 0) {
            // Update existing admin password
            db.query('UPDATE admin SET password = ? WHERE username = ?', [hashedPassword, username], (err) => {
                if (err) {
                    console.error('Error updating admin password:', err);
                } else {
                    console.log('Admin password updated successfully');
                }
                process.exit();
            });
        } else {
            // Create new admin
            db.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
                if (err) {
                    console.error('Error creating admin:', err);
                } else {
                    console.log('Admin user created successfully');
                }
                process.exit();
            });
        }
    });
};

createAdmin();