const WebSocket = require('ws');
const ChatMessage = require('../models/chatMessage');
const User = require('../models/User');

exports.getMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await ChatMessage.findById(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.find().sort('timestamp');

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const { message } = req.body;

        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newMessage = new ChatMessage({
            username: user.username,
            message,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newMessage.save();

        if (req.ws && req.ws.clients) {
            req.ws.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'new_message', data: newMessage }));
                }
            });
        }

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const { message } = req.body;
        
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedMessage = await ChatMessage.findByIdAndUpdate(id, {
            username: user.username,
            message,
            updatedAt: new Date()
        }, { new: true });

        if (!updatedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (req.ws && req.ws.clients) {
            req.ws.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'changed_message', data: updatedMessage }));
                }
            });
        }

        res.json(updatedMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMessage = await ChatMessage.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (req.ws && req.ws.clients) {
            req.ws.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'deleted_message', data: deletedMessage }));
                }
            });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
