const db = require('../../config/db');
const path = require('path');

const categoryController = {
    showCategories: (req, res) => {
        const sql = 'SELECT * FROM categories WHERE is_deleted = FALSE ORDER BY id DESC';
        db.query(sql, (err, categories) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { message: 'Database error occurred' });
            }
            
            res.render('admin/categories', { 
                categories: categories || [],
                active: 'categories',
                adminId: req.session.adminId,
                pageTitle: 'Category Management'  // Add this line
            });
        });
    },

    getAllCategories: (req, res) => {
    const sql = 'SELECT id, name, image, status FROM categories WHERE is_deleted = 0 ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }
        res.json(results); // Send JSON response
    });
    },

    addCategory: (req, res) => {
        const { name, status } = req.body;
        const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

        console.log('Adding category with image:', image);

        const sql = 'INSERT INTO categories (name, image, status) VALUES (?, ?, ?)';
        db.query(sql, [name, image, status || 'active'], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to add category', details: err.message });
            }
            res.json({ success: true, id: result.insertId });
        });
    },

    updateCategory: (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        
        const selectSql = 'SELECT status, image FROM categories WHERE id = ? AND is_deleted = FALSE';
        db.query(selectSql, [id], (selectErr, results) => {
            if (selectErr) {
                console.error('Select error:', selectErr);
                return res.status(500).json({ error: 'Failed to fetch category' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }

            let updateFields = { name };
            updateFields.status = results[0].status;

            if (req.file) {
                // Ensure the image path starts with a forward slash
                updateFields.image = req.file.path.replace(/\\/g, '/').replace('public', '');
            }

            console.log('Updating category with image path:', updateFields.image);

            const updateSql = 'UPDATE categories SET ? WHERE id = ? AND is_deleted = FALSE';
            db.query(updateSql, [updateFields, id], (updateErr, result) => {
                if (updateErr) {
                    console.error('Update error:', updateErr);
                    return res.status(500).json({ error: 'Failed to update category' });
                }
                
                res.json({ success: true });
            });
        });
    },

    toggleStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        console.log('Toggle status:', { id, status });

        const sql = 'UPDATE categories SET status = ? WHERE id = ? AND is_deleted = FALSE';
        db.query(sql, [status, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to update status' });
            }
            if (result.affectedRows > 0) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        });
    },

    deleteCategory: (req, res) => {
        const { id } = req.params;
        const sql = 'UPDATE categories SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        db.query(sql, [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete category' });
            }
            res.json({ success: true });
        });
    }
};

module.exports = categoryController;