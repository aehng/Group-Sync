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
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        disabled={disabled}
        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
      />
      <button type="submit" disabled={disabled} style={{ padding: "10px 14px" }}>
        Send
      </button>
    </form>
  );
}
