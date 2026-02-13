import { useParams } from "react-router-dom";
import MessageBoard from "../components/MessageBoard";

export default function GroupMessagesPage() {
  const { groupId } = useParams();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #ddd" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Group {groupId} — Messages</div>
        <div style={{ fontSize: 12, color: "#666" }}>
          Messaging board
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <MessageBoard groupId={groupId} />
      </main>
    </div>
  );
}
