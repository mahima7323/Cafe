require('dotenv').config();
console.log("Loaded ENV:", process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure upload directories exist
const uploadDirs = [
    path.join(__dirname, 'public/uploads'),
    path.join(__dirname, 'public/uploads/categories'),
    path.join(__dirname, 'public/uploads/subcategories'),
    path.join(__dirname, 'public/uploads/items'),
    path.join(__dirname, 'public/images')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file middleware configuration
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/subcategories', express.static(path.join(__dirname, 'public/uploads/subcategories')));
app.use('/uploads/categories', express.static(path.join(__dirname, 'public/uploads/categories')));
app.use('/uploads/items', express.static(path.join(__dirname, 'public/uploads/items')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');

app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running...');
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
