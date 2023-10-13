const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        if (req.userId) {
            const user = await User.findById(req.userId);
            
            if (user) {
                user.updatedAt = new Date();
                await user.save();
            }
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};