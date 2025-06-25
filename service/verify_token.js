const jwt = require('jsonwebtoken');

// Middleware to verify JWT token stored in session.
function verifyToken(req, res, next) {
    const token = req.session?.token;

    if (!token) {
        console.warn("Auth failed: No token in session");
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
}

module.exports = verifyToken;
