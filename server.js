// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb+srv://FizanFaisal:6Izk5v3Jm9dQFjvp@cluster0.wma7bbm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a schema and model for messages
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Serve static files
app.use(express.static('public'));

// Handle new connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send previous messages
  Message.find().then(messages => {
    socket.emit('previousMessages', messages);
  });

  // Handle incoming messages
  socket.on('sendMessage', (data) => {
    const message = new Message(data);
    message.save().then(() => {
      io.emit('message', data);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
