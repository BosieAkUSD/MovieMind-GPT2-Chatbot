import React, { useState } from "react";
import axios from "axios";

const ChatBotInterface = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      // Perform the action you want on Ctrl + Enter
      console.log("Ctrl + Enter pressed. Message: ", userInput);
      // For example, clear input or send message
      handleSend()
      setUserInput("");  // Clears the input after action
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Update chat history with user message
    setChatHistory([...chatHistory, { sender: "User", message: userInput }]);

    try {
      // Make a request to the FastAPI backend
      const response = await axios.post("http://localhost:8080/chat", {
        message: userInput,
      });

      // Update chat history with chatbot response
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
  };

  return (
    <div style={{  backgroundColor: "#282c34", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "auto" }}>
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
        style={{ width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default ChatBotInterface;