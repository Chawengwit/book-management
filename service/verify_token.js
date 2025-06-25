const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.session.token;
    if (!token) return res.redirect('/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        console.log("#### CC", err);
        return res.redirect('/login');
    }
}

module.exports = verifyToken;
