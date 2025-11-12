const bcrypt = require('bcryptjs');
const db = require('../../config/db');

const adminController = {
    loginPage: (req, res) => {
        res.render('admin/login');
    },

    login: async (req, res) => {
        const { username, password } = req.body;

        db.query('SELECT * FROM admin WHERE username = ?', [username], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const admin = results[0];
            const isValid = await bcrypt.compare(password, admin.password);

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            req.session.adminId = admin.id;
            res.json({ success: true });
        });
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    },

    dashboard: (req, res) => {
        res.render('admin/dashboard');
    },

    categories: (req, res) => {
        // Fetch categories from database
        const sql = 'SELECT * FROM categories WHERE is_deleted = FALSE';
        db.query(sql, (err, categories) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).send(`Database error: ${err.message}`);
            }
            res.render('admin/categories', { categories: categories || [] });
        });
    },

users: (req, res) => {
    const sql = 'SELECT name, email, city, address FROM users';
    db.query(sql, (err, users) => {
        if (err) return res.status(500).send('Database error');
        res.render('admin/users', { 
            users,
            active: 'users',          // Highlight "Users" tab in navbar
            pageTitle: 'Users Management' // Optional, for page heading
        });
    });
}

};

module.exports = adminController;