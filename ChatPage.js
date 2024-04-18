import React, { useState, useEffect } from 'react';

function ChatPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch messages from the backend or use static data
    const fetchedMessages = [
      { id: 1, sender: 'Alex', content: 'Hi there!' },
      // Add more messages
    ];
    setMessages(fetchedMessages);
  }, []);

  return (
    <div className="chat-page">
      <h1>Chat</h1>
      <div className="messages-list">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.sender}:</strong> {message.content}
          </div>
        ))}
      </div>
      {/* Add input field and button to send messages */}
    </div>
  );
}

export default ChatPage;