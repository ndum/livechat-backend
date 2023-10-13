const mongooseConnection = require('../config/db');

module.exports = (ws) => {
    return (req, res, next) => {
        req.ws = ws;
        req.db = mongooseConnection;
        next();
    };
};