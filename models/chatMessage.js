const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    username: String,
    message: String,
    createdAt: Date,
    updatedAt: Date
});

chatMessageSchema.pre('save', function (next) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    this.updatedAt = now;
    next();
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);