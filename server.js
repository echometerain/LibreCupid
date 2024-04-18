require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (data) => {
    const message = JSON.parse(data);
    // Example message handling
    await db.collection('messages').add(message);
    console.log('Message saved to Firestore');
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${process.env.PORT || 8080}`);
});
