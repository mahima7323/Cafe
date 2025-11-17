const db = require('../../config/db');

const itemsController = {
    list: (req, res) => {
        if (!req.session.adminId) return res.redirect('/admin/login');
        const sql = `
            SELECT items.*, subcategories.name AS subcategory_name, categories.name AS category_name
            FROM items
            JOIN subcategories ON items.subcategory_id = subcategories.id
            JOIN categories ON subcategories.category_id = categories.id
            WHERE items.is_deleted = FALSE
            ORDER BY items.id DESC`;
        const subcatsSql = 'SELECT id, name FROM subcategories WHERE is_deleted = FALSE';
        
        db.query(sql, (err, items) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('error', { message: 'Database error occurred' });
            }
            
            db.query(subcatsSql, (err2, subcategories) => {
                if (err2) {
                    console.error('Database error:', err2);
                    return res.status(500).render('error', { message: 'Database error occurred' });
                }
                
                res.render('admin/items', { 
                    items: items || [], 
                    subcategories: subcategories || [],
                    active: 'items',
                    adminId: req.session.adminId
                });
            });
        });
    },

    create: (req, res) => {
        const { subcategory_id, name, description, price } = req.body;
        const image = req.file ? `/uploads/items/${req.file.filename}` : null;
        const sql = `INSERT INTO items (subcategory_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [subcategory_id, name, description, price, image], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to add item' });
            const select = `
                SELECT items.*, subcategories.name AS subcategory_name, categories.name AS category_name FROM items
                JOIN subcategories ON items.subcategory_id = subcategories.id
                JOIN categories ON subcategories.category_id = categories.id
                WHERE items.id = ?`;
            db.query(select, [result.insertId], (e2, rows) => {
                if (e2 || !rows || rows.length === 0) return res.json({ success: true, id: result.insertId });
                res.json({ success: true, item: rows[0] });
            });
        });
    },

update: (req, res) => {
    const { id } = req.params;
    const { subcategory_id, name, description, price, status } = req.body;

    // First fetch current status so it won’t reset
    const getSql = 'SELECT status FROM items WHERE id = ? AND is_deleted = FALSE';
    db.query(getSql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch item' });
        if (!rows.length) return res.status(404).json({ error: 'Item not found' });

        const currentStatus = rows[0].status;

        const fields = {
            subcategory_id,
            name,
            description,
            price,
            status: status || currentStatus   // keep existing if not passed
        };

        if (req.file) fields.image = `/uploads/items/${req.file.filename}`;

        const sql = 'UPDATE items SET ? WHERE id = ? AND is_deleted = FALSE';
        db.query(sql, [fields, id], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: 'Failed to update item' });

            const select = `
                SELECT items.*, subcategories.name AS subcategory_name, categories.name AS category_name
                FROM items
                JOIN subcategories ON items.subcategory_id = subcategories.id
                JOIN categories ON subcategories.category_id = categories.id
                WHERE items.id = ?`;
            db.query(select, [id], (e2, rows2) => {
                if (e2 || !rows2.length) return res.json({ success: true });
                res.json({ success: true, item: rows2[0] });
            });
        });
    });
},

getItemsBySubcategory: (req, res) => {
    const subcategoryId = req.query.subcategoryId;

    if (!subcategoryId) {
        return res.status(400).json({ error: "subcategoryId is required" });
    }
    
    const sql = `
        SELECT items.*, 
               subcategories.name AS subcategory_name,
               categories.name AS category_name
        FROM items
        JOIN subcategories ON items.subcategory_id = subcategories.id
        JOIN categories ON subcategories.category_id = categories.id
        WHERE items.subcategory_id = ?
          AND items.is_deleted = FALSE
        ORDER BY items.id DESC
    `;

    db.query(sql, [subcategoryId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
},


    toggleStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        db.query('UPDATE items SET status=? WHERE id = ? AND is_deleted = FALSE', [status, id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to update status' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
            res.json({ success: true });
        });
    },

    remove: (req, res) => {
        const { id } = req.params;
        db.query('UPDATE items SET is_deleted = TRUE WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete item' });
            res.json({ success: true });
        });
    }
};

module.exports = itemsController;


