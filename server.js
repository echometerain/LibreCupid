require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Message = mongoose.model('Message', new mongoose.Schema({
  sender: String,
  receiver: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
}));

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (data) => {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'message':
        const savedMessage = new Message({
          sender: message.sender,
          receiver: message.receiver,
          content: message.content,
        });
        await savedMessage.save();
        broadcastMessage(message, ws);
        break;
      // Add more case handlers for different message types (e.g., 'typing', 'login')
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcastMessage(message, senderWs) {
  wss.clients.forEach((client) => {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});