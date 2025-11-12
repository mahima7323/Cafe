const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.admin = decoded;
        next();
    });
}

module.exports = verifyToken;
