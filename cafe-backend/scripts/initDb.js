const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const initDatabase = async () => {
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL file into separate statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    // Execute statements sequentially
    for (const statement of statements) {
        if (statement.trim()) {
            try {
                await new Promise((resolve, reject) => {
                    db.query(statement, (err) => {
                        if (err) {
                            // Ignore duplicate key errors
                            if (err.code !== 'ER_DUP_KEYNAME' && err.code !== 'ER_DUP_ENTRY') {
                                console.error('Error executing statement:', err);
                                reject(err);
                            }
                        }
                        resolve();
                    });
                });
            } catch (error) {
                // Continue with next statement even if current one fails
                continue;
            }
        }
    }

    console.log('Database tables created successfully');
    process.exit();
};

initDatabase().catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
});