import { useState } from "react";

function ChatPanel({ messages, onSendMessage, sellerName, sellerResponseTime }) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSendMessage(draft);
    setDraft("");
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Buyer to seller chat</p>
          <h3>{sellerName}</h3>
        </div>
        <span className="status-badge">{sellerResponseTime}</span>
      </div>

      <div className="message-list">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`message-bubble ${message.sender === "buyer" ? "message-buyer" : ""}`}
          >
            <strong>{message.senderName}</strong>
            <p>{message.text}</p>
            <span>{message.time}</span>
          </article>
        ))}
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask the seller about availability, specs, or delivery..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default ChatPanel;
