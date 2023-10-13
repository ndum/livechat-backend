const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const user = new User({ username, password, created_at: new Date(), updated_at: new Date() });
        
        await user.save();

        res.status(201).json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Wrong username or password' });
        }

        user.updated_at = new Date();
        
        await user.save(); 

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        req.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'new_login', data: {username: username}}));
            }
        });

        res.json({ userId: user._id, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};