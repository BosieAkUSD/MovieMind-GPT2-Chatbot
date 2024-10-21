import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const ChatBotInterface = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  
  // Create a ref for the chat container
  const chatContainerRef = useRef(null);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if ( e.key === "Enter") {
      handleSend();
      setUserInput(""); // Clears the input after sending
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Update chat history with user message
    setChatHistory((prev) => [...prev, { sender: "User", message: userInput }]);

    try {
      // Make a request to the FastAPI backend
      const response = await axios.post("https://api-weathered-resonance-8042.fly.dev/chat", {
        message: userInput,
      });

      // Update chat history with bot's response
      setChatHistory((prev) => [
        ...prev,
        { sender: "Bot", message: response.data.reply },
      ]);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "Bot", message: "Error: Unable to get response." },
      ]);
    }

    // Clear the input field
    setUserInput("");

    // Scroll the chat container to the bottom after sending
    scrollToBottom();
  };

  // Function to scroll to the bottom of the chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Use `useEffect` to scroll to the bottom whenever chatHistory changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <div
      style={{
        backgroundColor: "#282c34",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        ref={chatContainerRef} // Attach the ref to the chat container
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
        }}
      >
        {chatHistory.map((chat, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{chat.sender}:</strong> {chat.message}
          </div>
        ))}
      </div>
      <textarea
        style={{ width: "97%", marginTop: "10px", padding: "10px", resize: "none" }}
        rows="3"
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
      />
      <button
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default ChatBotInterface;