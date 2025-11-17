const db = require('../../config/db');
const path = require('path');

const subcategoryController = {
    showSubcategories: (req, res) => {
        if (!req.session.adminId) {
            return res.redirect('/admin/login');
        }

        const sql = `
            SELECT sc.*, c.name as category_name 
            FROM subcategories sc 
            LEFT JOIN categories c ON sc.category_id = c.id 
            WHERE sc.is_deleted = FALSE
            ORDER BY sc.id DESC`;
        
        const categorySql = 'SELECT id, name FROM categories WHERE is_deleted = FALSE';

        db.query(sql, (err, subcategories) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { message: 'Database error occurred' });
            }
            
            db.query(categorySql, (categoryErr, categories) => {
                if (categoryErr) {
                    console.error('Category fetch error:', categoryErr);
                    return res.status(500).render('error', { message: 'Database error occurred' });
                }

                try {
                    return res.render('admin/subcategories', { 
                        subcategories: subcategories || [],
                        categories: categories || [],
                        adminId: req.session.adminId,
                        active: 'subcategories' // Add this line
                    });
                } catch (renderErr) {
                    console.error('Render error:', renderErr);
                    return res.status(500).send('Error rendering page');
                }
            });
        });
    },

    getAllSubcategories: (req, res) => {
        // console.log('req.qery:', req.query);
    const perentCategory = req.query.categoryId;

    const sql = `SELECT * FROM subcategories WHERE is_deleted = FALSE AND category_id = ${perentCategory} ORDER BY id DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
},


    addSubcategory: (req, res) => {
        const { name, category_id } = req.body;
        const image = req.file ? `/uploads/subcategories/${req.file.filename}` : null;

        const sql = 'INSERT INTO subcategories (name, category_id, image, status) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, category_id, image, 'active'], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to add subcategory', details: err.message });
            }
            const selectSql = `
                SELECT sc.*, c.name AS category_name
                FROM subcategories sc
                LEFT JOIN categories c ON sc.category_id = c.id
                WHERE sc.id = ?
            `;
            db.query(selectSql, [result.insertId], (selectErr, rows) => {
                if (selectErr || !rows || rows.length === 0) {
                    return res.json({ success: true, id: result.insertId });
                }
                return res.json({ success: true, subcategory: rows[0] });
            });
        });
    },

    updateSubcategory: (req, res) => {
        const { id } = req.params;
        const { name, category_id } = req.body;
        
        const selectSql = 'SELECT status FROM subcategories WHERE id = ? AND is_deleted = FALSE';
        db.query(selectSql, [id], (selectErr, results) => {
            if (selectErr) {
                return res.status(500).json({ error: 'Failed to fetch subcategory' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Subcategory not found' });
            }

            let updateFields = { name, category_id };
            updateFields.status = results[0].status;

            if (req.file) {
                updateFields.image = `/uploads/subcategories/${req.file.filename}`;
            }

            const updateSql = 'UPDATE subcategories SET ? WHERE id = ? AND is_deleted = FALSE';
            db.query(updateSql, [updateFields, id], (updateErr, result) => {
                if (updateErr) {
                    return res.status(500).json({ error: 'Failed to update subcategory' });
                }
                const selectUpdatedSql = `
                    SELECT sc.*, c.name AS category_name
                    FROM subcategories sc
                    LEFT JOIN categories c ON sc.category_id = c.id
                    WHERE sc.id = ?
                `;
                db.query(selectUpdatedSql, [id], (selectErr2, rows) => {
                    if (selectErr2 || !rows || rows.length === 0) {
                        return res.json({ success: true });
                    }
                    return res.json({ success: true, subcategory: rows[0] });
                });
            });
        });
    },

    toggleStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        const sql = 'UPDATE subcategories SET status = ? WHERE id = ? AND is_deleted = FALSE';
        db.query(sql, [status, id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update status' });
            }
            if (result.affectedRows > 0) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Subcategory not found' });
            }
        });
    },

    deleteSubcategory: (req, res) => {
        const { id } = req.params;
        const sql = 'UPDATE subcategories SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        db.query(sql, [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete subcategory' });
            }
            res.json({ success: true });
        });
    }
};

module.exports = subcategoryController;