import React, { useMemo } from "react";
import MessageBubble from "./MessageBubble";

function MessageList({ messages }) {
  const renderedMessages = useMemo(
    () =>
      (messages || []).map((m) => (
        <MessageBubble key={m.id} message={m} />
      )),
    [messages]
  );

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
      {renderedMessages}
    </div>
  );
}

export default React.memo(MessageList);
