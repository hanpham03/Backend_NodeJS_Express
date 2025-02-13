const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user.routes');
// const authRoutes = require('./routes/auth.routes');
const difyAccountRoutes = require('./routes/difyAccount.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const chatSessionRoutes = require('./routes/chatSession.routes');
const messageRoutes = require('./routes/message.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);
app.use('/api/dify-accounts', difyAccountRoutes);
app.use('/api/chatbots', chatbotRoutes);
app.use('/api/chat-sessions', chatSessionRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;