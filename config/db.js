// dotenv is already configured in server.js
const mongoose = require('mongoose');

const isDocker = process.env.DOCKER === 'true';
const MONGODB_URI = isDocker ? 'mongodb://mongodb:27017/livechat' : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/livechat');

mongoose.connect(MONGODB_URI).catch(err => console.error('Error connecting to MongoDB:', err.message));

module.exports = mongoose.connection;
