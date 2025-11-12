require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { name, email: rawEmail, password, age, gender, city, address } = req.body;

  // Normalize email
  const email = rawEmail ? rawEmail.trim().toLowerCase() : null;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, Email, and Password are required" });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) {
      console.error("Database error on SELECT:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        `INSERT INTO users (name, email, password, age, gender, city, address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, age || null, gender || null, city || null, address || null],
        (err) => {
          if (err) {
            console.error("Database error on INSERT:", err);
            return res.status(500).json({ message: "Database error", error: err.sqlMessage });
          }
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    } catch (error) {
      console.error("Password hashing error:", error);
      res.status(500).json({ message: "Password hashing failed" });
    }
  });
};


exports.loginUser = async (req, res) => {
    debugger
  const { email: email, password } = req.body;
  console.log("Login attempt for email:", email);

  // Normalize email
//   const email = rawEmail ? rawEmail.trim().toLowerCase() : null;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.log("JWT Secret:", process.env.JWT_SECRET);
      const token = jwt.sign(
        { id: user.id, email: user.email },
        //process.env.fsfsfsf45664132sds,
        "fsfsfsf45664132sds",
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      console.error("Error comparing password:", err);
      return res.status(500).json({ message: "Login failed" });
    }
  });
};
