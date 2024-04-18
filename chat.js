const ws = new WebSocket('ws://localhost:8080');
let currentUser = 'User1'; // This should be dynamically set based on the logged-in user

ws.onopen = (event) => {
  console.log('Connected to the WebSocket server');
  // Send a login message or similar if needed
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  displayMessage(message);
};

function sendMessage(receiver, content) {
  const message = {
    type: 'message',
    sender: currentUser,
    receiver: receiver,
    content: content,
  };
  ws.send(JSON.stringify(message));
  displayMessage(message, true);
}

function displayMessage(message, isOwnMessage = false) {
  // Update the UI to display the message
  // This function needs to be implemented based on your UI design
}