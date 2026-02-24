import { useParams } from "react-router-dom";
import MessageBoard from "../components/MessageBoard";

export default function GroupMessagesPage() {
  const { groupId } = useParams();

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh",
      background: "#fff"
    }}>
      <header style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid #eee",
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#333" }}>
          Group {groupId}
        </div>
        <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
          Group messaging
        </div>
      </header>

      <main style={{ flex: 1, overflow: "hidden" }}>
        <MessageBoard groupId={groupId} />
      </main>
    </div>
  );
}
