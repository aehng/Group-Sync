import React, { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";

function MessageBubble({ message }) {
  const mine = message.sender?.id === "me";

  const { relativeTime, absoluteTime } = useMemo(() => {
    if (!message.created_at) return { relativeTime: "", absoluteTime: "" };

    const parsed = new Date(message.created_at);
    if (Number.isNaN(parsed.getTime())) {
      return { relativeTime: "", absoluteTime: "" };
    }

    return {
      relativeTime: formatDistanceToNow(parsed, { addSuffix: true }),
      absoluteTime: format(parsed, "PPpp"),
    };
  }, [message.created_at]);

  return (
    <div
      className="message-bubble"
      role="article"
      aria-label={`Message from ${mine ? "you" : message.sender?.username ?? message.sender?.first_name ?? "unknown user"}`}
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
        <time dateTime={message.created_at || undefined} title={absoluteTime} style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap" }}>
          {relativeTime}
        </time>
      </div>

      <div style={{ marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{message.content}</div>
    </div>
  );
}

export default React.memo(MessageBubble);
