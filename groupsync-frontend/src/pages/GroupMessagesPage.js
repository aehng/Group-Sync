import { useParams } from "react-router-dom";
import MessageList from "../components/MessageList";
import MessageComposer from "../components/MessageComposer";
import { useMessages } from "../hooks/useMessages";

export default function GroupMessagesPage() {
  const { groupId } = useParams();
  const { messages, isLoading, error, sendMessage, loadOlder } = useMessages(groupId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #ddd" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Group {groupId} — Messages</div>
        <div style={{ fontSize: 12, color: "#666" }}>
          MVP chat (mock now, API later)
        </div>
      </header>

      <main style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {error ? (
          <div style={{ color: "crimson" }}>{String(error)}</div>
        ) : (
          <>
            <button onClick={loadOlder} disabled={isLoading} style={{ marginBottom: 12 }}>
              {isLoading ? "Loading..." : "Load older"}
            </button>
            <MessageList messages={messages} />
          </>
        )}
      </main>

      <footer style={{ padding: 12, borderTop: "1px solid #ddd" }}>
        <MessageComposer onSend={sendMessage} disabled={isLoading} />
      </footer>
    </div>
  );
}
