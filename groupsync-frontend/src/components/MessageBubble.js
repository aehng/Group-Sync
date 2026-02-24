import { formatDistanceToNow } from "date-fns";

export default function MessageBubble({ message }) {
  const mine = message.sender?.id === "me";
  
  // Format relative timestamp (e.g., "2 minutes ago")
  const relativeTime = message.created_at
    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
    : "";

  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "70%",
        border: "1px solid #ddd",
        borderRadius: 14,
        padding: "10px 12px",
        background: mine ? "#e8f5ff" : "#f9f9f9",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>
          {mine ? "You" : message.sender?.username ?? message.sender?.first_name ?? "Unknown"}
        </div>
        <div style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap" }}>
          {relativeTime}
        </div>
      </div>

      <div style={{ marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{message.content}</div>
    </div>
  );
}
