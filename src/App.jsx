import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function linkify(text) {
  const urlRegex = /^(https?:\/\/)?([\w.-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
  const words = text.split(/(\s+)/);

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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const apiBaseUrl = "https://swimsafer-chatbot.onrender.com";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "user", text: userMessage },
    ]);
    setInput("");
    setIsLoading(true);

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
        { id: prev.length + 1, sender: "bot", text: "Server timeout, please try again later" },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-header">🏊 SwimSafer FAQ Chatbot</div>

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

        {isLoading && (
          <div className="message-bubble bot-bubble typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot delay-1" />
            <span className="typing-dot delay-2" />
          </div>
        )}

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
