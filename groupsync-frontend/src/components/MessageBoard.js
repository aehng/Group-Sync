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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f5f5f5" }}>
      {error ? (
        <div style={{ 
          color: "#d32f2f", 
          padding: 16, 
          background: "#ffebee",
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 14
        }}>
          Error loading messages: {String(error)}
        </div>
      ) : (
        <>
          <div style={{ 
            overflow: "auto", 
            padding: "16px 20px", 
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            <button 
              onClick={loadOlder} 
              disabled={isLoading}
              style={{
                marginBottom: 12,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: isLoading ? "#eee" : "#fff",
                color: isLoading ? "#999" : "#666",
                fontSize: "13px",
                cursor: isLoading ? "not-allowed" : "pointer",
                alignSelf: "center"
              }}
            >
              {isLoading ? "Loading older messages..." : "Load older messages"}
            </button>
            <MessageList messages={messages} />
            <div ref={endRef} />
          </div>

          <div style={{ 
            borderTop: "1px solid #ddd", 
            background: "#fff",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.05)"
          }}>
            <MessageComposer onSend={sendMessage} disabled={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
