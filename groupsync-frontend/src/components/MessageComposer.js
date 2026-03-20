import { useState } from "react";

export default function MessageComposer({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, padding: "0 12px 12px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        aria-label="Message input"
        disabled={disabled}
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          fontSize: "14px",
          fontFamily: "inherit",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        aria-label="Send message"
        className="message-send-btn"
        style={{
          padding: "10px 18px",
          borderRadius: 10,
          border: "none",
          background: disabled ? "#ccc" : "#007bff",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "600",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background 0.2s, transform 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.target.style.background = "#0056b3";
            e.target.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.target.style.background = "#007bff";
            e.target.style.transform = "translateY(0)";
          }
        }}
      >
        Send
      </button>
    </form>
  );
}
