import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function linkify(text) {
  const urlRegex = /^(https?:\/\/)?([\w.-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

  // Split text by spaces to preserve words intact
  const words = text.split(/(\s+)/); // keep spaces in result

  return words.map((word, index) => {
    if (urlRegex.test(word)) {
      const href = word.startsWith("http") ? word : "https://" + word;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4ea8de", textDecoration: "underline" }}
        >
          {word}
        </a>
      );
    } else {
      return word;
    }
  });
}

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Use env var or fallback localhost
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "user", text: input.trim() },
    ]);
    const userMessage = input.trim();
    setInput("");

    try {
      const res = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: "bot", text: data.response || "No response." },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: "bot", text: "Error connecting to backend." },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-header">Chatbot</div>

      <div className="messages-area">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${
              msg.sender === "user" ? "user-bubble" : "bot-bubble"
            }`}
          >
            {linkify(msg.text)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="input-area"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button type="submit" className="send-btn" aria-label="Send message">
          ➤
        </button>
      </form>
    </div>
  );
}
