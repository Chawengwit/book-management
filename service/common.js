const jwt = require('jsonwebtoken');

const secret_key = 'helloworld';

function verifyToken(req, res, next) {
    const token = req.session.token;
    if (!token) return res.redirect('/login');

    try {
        const decoded = jwt.verify(token, secret_key);
        req.user = decoded;
        next();

    } catch (err) {
        console.log("#### CC", err);
        return res.redirect('/login');
    }
}

module.exports = verifyToken;
