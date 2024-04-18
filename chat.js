// Initialize Firebase (replace with your Firebase config object)
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID" //Replace YOUR_API_KEY, YOUR_PROJECT_ID, YOUR_SENDER_ID, and YOUR_APP_ID with the actual Firebase project configuration
};
firebase.initializeApp(firebaseConfig);

let ws; // Declare WebSocket variable globally to be accessible throughout the script

// Listen for auth state changes
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('User signed in:', user.displayName);
    // User is signed in, establish WebSocket connection
    establishWebSocketConnection(user);
  } else {
    // No user is signed in, show the Google Sign-In button
    console.log('No user signed in.');
  }
});

// Sign in with Google
function signInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
      // Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // You can establish WebSocket connection here if needed
    }).catch((error) => {
      console.error('SignIn Error', error);
    });
}

// Establish WebSocket connection
function establishWebSocketConnection(user) {
  ws = new WebSocket('ws://localhost:8080'); // Use your WebSocket server URL

  ws.onopen = () => {
    console.log('WebSocket connection established');
    // Send a message to the server to register the user
    ws.send(JSON.stringify({ type: 'register', userId: user.uid }));
  };

  ws.onmessage = (event) => {
    console.log('Message from server:', event.data);
    displayMessage(event.data); // Display the message
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
}

// Send message function
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  if (message && ws) {
    ws.send(JSON.stringify({ type: 'message', content: message, sender: firebase.auth().currentUser.uid }));
    messageInput.value = ''; // Clear input field after sending
  }
}

// Delete message funciton
function deleteMessage(messageId) {
  // Check if WebSocket connection is open
  if (ws && ws.readyState === WebSocket.OPEN) {
    // Send a delete request to the server with the message ID
    ws.send(JSON.stringify({ type: 'delete', messageId: messageId }));
  } else {
    console.error('WebSocket connection is not open.');
  }
}

// Display message function
function displayMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const msgElement = document.createElement('div');
  const deleteButton = document.createElement('button');

  // Assuming message is an object with id and content properties
  msgElement.textContent = message.content; // Display the message content
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = function() { deleteMessage(message.id); }; // Attach delete function

  msgElement.appendChild(deleteButton);
  messagesDiv.appendChild(msgElement);
}

// Sign out function
function signOut() {
  firebase.auth().signOut().then(() => {
    console.log('User signed out.');
    if (ws) {
      ws.close(); // Close WebSocket connection
    }
  }).catch((error) => {
    console.error('SignOut Error', error);
  });
}
