// dotenv is already configured in server.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;

        if (req.userId) {
            const user = await User.findById(req.userId);
            if (user) {
                user.updatedAt = new Date();
                await user.save();
            }
        }

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Authentifizierung fehlgeschlagen' });
    }
};