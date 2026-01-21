import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  if (!messages || messages.length === 0) {
    return <div style={{ color: "#666" }}>No messages yet.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
}
