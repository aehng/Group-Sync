import React, { useRef, useEffect } from "react";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import { useMessages } from "../hooks/useMessages";

export default function MessageBoard({ groupId }) {
  const { messages, isLoading, error, sendMessage, loadOlder } = useMessages(groupId);
  const endRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // The component simply composes the lower-level pieces: it shows a
  // scrollable messages area and a composer. The `loadOlder` handler
  // will use cursor pagination via the hook to append older messages.

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {error ? (
        <div style={{ color: "crimson", padding: 12 }}>{String(error)}</div>
      ) : (
        <>
          <div style={{ overflow: "auto", padding: 12, flex: 1 }}>
            <button onClick={loadOlder} disabled={isLoading} style={{ marginBottom: 12 }}>
              {isLoading ? "Loading..." : "Load older"}
            </button>
            <MessageList messages={messages} />
            <div ref={endRef} />
          </div>

          <div style={{ borderTop: "1px solid #eee", padding: 12 }}>
            <MessageComposer onSend={sendMessage} disabled={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
