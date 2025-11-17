const db = require('../../config/db');

// 1️⃣ Add item to cart
exports.addToCart = (req, res) => {
    const { user_id, item_id, quantity } = req.body;

    if (!user_id || !item_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if item already exists in cart
    const checkSql = `
        SELECT * FROM cart WHERE user_id = ? AND item_id = ? AND is_deleted = 0
    `;

    db.query(checkSql, [user_id, item_id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (rows.length > 0) {
            // If item exists → update quantity
            const updateSql = `
                UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?
            `;
            db.query(updateSql, [quantity, user_id, item_id], (err2) => {
                if (err2) return res.status(500).json({ message: "Failed to update cart" });
                return res.json({ message: "Item quantity updated successfully" });
            });
        } else {
            // Insert new cart item
            const insertSql = `
                INSERT INTO cart (user_id, item_id, quantity)
                VALUES (?, ?, ?)
            `;
            db.query(insertSql, [user_id, item_id, quantity], (err3) => {
                if (err3) return res.status(500).json({ message: "Failed to add item" });
                return res.json({ message: "Item added to cart successfully" });
            });
        }
    });
};


// 2️⃣ Get all cart items for a user
exports.getCart = (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ message: "User ID required" });
    }

    const sql = `
        SELECT 
            cart.id,
            cart.quantity,
            items.id AS item_id,
            items.name,
            items.price,
            items.image,
            subcategories.name AS subcategory_name
        FROM cart
        JOIN items ON cart.item_id = items.id
        JOIN subcategories ON items.subcategory_id = subcategories.id
        WHERE cart.user_id = ? AND cart.is_deleted = 0
        ORDER BY cart.id DESC;
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};


// 3️⃣ Update quantity
exports.updateQuantity = (req, res) => {
    const { cart_id, type } = req.body;

    if (!cart_id || !type) {
        return res.status(400).json({ message: "Missing fields" });
    }

    let sql = "";
    if (type === "inc") sql = "UPDATE cart SET quantity = quantity + 1 WHERE id = ?";
    if (type === "dec") sql = "UPDATE cart SET quantity = quantity - 1 WHERE id = ? AND quantity > 1";

    db.query(sql, [cart_id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update quantity" });
        res.json({ message: "Quantity updated" });
    });
};


// 4️⃣ Remove item
exports.removeItem = (req, res) => {
    const cart_id = req.body.cart_id;

    if (!cart_id) return res.status(400).json({ message: "Cart ID missing" });

    const sql = "UPDATE cart SET is_deleted = 1 WHERE id = ?";
    db.query(sql, [cart_id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to remove item" });
        res.json({ message: "Item removed" });
    });
};


// 5️⃣ Clear cart (optional)
exports.clearCart = (req, res) => {
    const user_id = req.body.user_id;

    const sql = "UPDATE cart SET is_deleted = 1 WHERE user_id = ?";
    db.query(sql, [user_id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to clear cart" });
        res.json({ message: "Cart cleared successfully" });
    });
};
