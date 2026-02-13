import { format } from "date-fns";

export default function MessageBubble({ message }) {
  const mine = message.sender?.id === "me";

  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "70%",
        border: "1px solid #ddd",
        borderRadius: 14,
        padding: "10px 12px",
        background: mine ? "#f4f8ff" : "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>
          {mine ? "You" : message.sender?.username ?? message.sender?.first_name ?? "Unknown"}
        </div>
        <div style={{ fontSize: 11, color: "#777" }}>
          {message.created_at ? format(new Date(message.created_at), "p") : ""}
        </div>
      </div>

      <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{message.content}</div>
    </div>
  );
}
