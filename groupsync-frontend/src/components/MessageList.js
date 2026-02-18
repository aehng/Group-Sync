import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div style={{ 
        color: "#999", 
        textAlign: "center", 
        padding: 20,
        fontSize: 14
      }}>
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
}
