// Assuming Firebase is already initialized and user is authenticated

// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:8080'); // Use your server's address

ws.onopen = () => {
  console.log('Connected to the WebSocket server');
  // You can now send messages
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onmessage = (event) => {
  // Handle incoming messages
  console.log('Message from server:', event.data);
  displayMessage(event.data);
};

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  if (message) {
    // Construct a message object or use plain text
    const messageObj = {
      type: 'message', // You can define different types of messages e.g., 'message', 'typing'
      content: message,
      sender: firebase.auth().currentUser.uid, // Example: Use user ID from Firebase Authentication
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(messageObj)); // Send the message as a string
    messageInput.value = ''; // Clear input field after sending
  }
}

function displayMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const msgElement = document.createElement('div');
  msgElement.textContent = message; // For simplicity, directly showing the message string
  messagesDiv.appendChild(msgElement);
}
