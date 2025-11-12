const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Route-aware destination: save into categories or subcategories
        const isSubcategoryRoute = /\/subcategories(\/|$)/.test(req.originalUrl);
        const isItemsRoute = /\/items(\/|$)/.test(req.originalUrl);
        const dest = isItemsRoute
            ? 'public/uploads/items'
            : isSubcategoryRoute
                ? 'public/uploads/subcategories'
                : 'public/uploads/categories';
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

module.exports = upload;