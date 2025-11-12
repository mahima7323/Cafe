const express = require('express');
const router = express.Router();
const isAdmin = require('../../middleware/adminAuth');
const upload = require('../../middleware/uploadMiddleware');
const adminController = require('../../controllers/admin/adminController');
const categoryController = require('../../controllers/admin/categoryController');
const subcategoryController = require('../../controllers/admin/subcategoryController');
const itemsController = require('../../controllers/admin/itemsController');
const db = require('../../config/db');

// Admin authentication routes
router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

// Protected routes
router.get('/dashboard', isAdmin, adminController.dashboard);

// Category routes
// router.get('/categories', (req, res) => {
//     db.query('SELECT id, name FROM categories WHERE is_deleted = FALSE', (err, results) => {
//         if (err) return res.status(500).json({ error: 'Database error' });
//         res.json(results);
//     });
// });
router.get('/categories', isAdmin, categoryController.showCategories);
router.post('/categories', isAdmin, upload.single('image'), categoryController.addCategory);
router.put('/categories/:id', upload.single('image'), categoryController.updateCategory);
router.delete('/categories/:id', isAdmin, categoryController.deleteCategory);
// Add this route with your other category routes
router.put('/categories/:id/toggle-status', isAdmin, categoryController.toggleStatus);

// Add these routes with your existing routes
router.get('/subcategories', isAdmin, subcategoryController.showSubcategories);
router.post('/subcategories', isAdmin, upload.single('image'), subcategoryController.addSubcategory);
router.put('/subcategories/:id', isAdmin, upload.single('image'), subcategoryController.updateSubcategory);
router.put('/subcategories/:id/toggle-status', isAdmin, subcategoryController.toggleStatus);
router.delete('/subcategories/:id', isAdmin, subcategoryController.deleteSubcategory);

// Items routes
// Backward-compatible alias for old URL
router.get('/food-items', (req, res) => res.redirect('/admin/items'));
router.get('/items', isAdmin, itemsController.list);
router.post('/items', isAdmin, upload.single('image'), itemsController.create);
router.put('/items/:id', isAdmin, upload.single('image'), itemsController.update);
router.put('/items/:id/toggle-status', isAdmin, itemsController.toggleStatus);
router.delete('/items/:id', isAdmin, itemsController.remove);

// Stats route
router.get('/stats', async (req, res) => {
    try {
        const [[{ categoryCount }]] = await db.promise().query('SELECT COUNT(*) AS categoryCount FROM categories WHERE is_deleted = FALSE');
        const [[{ subcategoryCount }]] = await db.promise().query('SELECT COUNT(*) AS subcategoryCount FROM subcategories WHERE is_deleted = FALSE');
        const [[{ itemCount }]] = await db.promise().query('SELECT COUNT(*) AS itemCount FROM items WHERE is_deleted = FALSE');
        res.json({ categoryCount, subcategoryCount, itemCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Users management route (list only)
router.get('/users', isAdmin, adminController.users);

router.get('/api/categories', categoryController.getAllCategories);

module.exports = router;