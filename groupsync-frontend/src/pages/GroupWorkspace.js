import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function GroupWorkspace() {
  const { groupId } = useParams();
  const [tab, setTab] = useState("messages");

  const tabStyle = (active) => ({
    padding: "12px 16px",
    border: "none",
    borderBottom: active ? "2px solid #007bff" : "1px solid #eee",
    background: "transparent",
    color: active ? "#007bff" : "#666",
    fontWeight: active ? "600" : "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid #eee",
        background: "#fff"
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#333", margin: "0 0 12px 0" }}>
          Group {groupId}
        </h2>
      </div>

      <div style={{ 
        display: "flex", 
        gap: 0,
        borderBottom: "1px solid #eee",
        background: "#fff"
      }}>
        <button 
          onClick={() => setTab("messages")}
          style={tabStyle(tab === "messages")}
        >
          Messages
        </button>
        <button 
          onClick={() => setTab("tasks")}
          style={tabStyle(tab === "tasks")}
        >
          Tasks
        </button>
        <button 
          onClick={() => setTab("members")}
          style={tabStyle(tab === "members")}
        >
          Members
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: "#f5f5f5" }}>
        {tab === "messages" && (
          <div style={{ padding: 20 }}>
            <p style={{ marginBottom: 12 }}>
              Open the messaging interface to communicate with your team:
            </p>
            <Link
              to={`/groups/${groupId}/messages`}
              style={{
                display: "inline-block",
                padding: "10px 16px",
                background: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: "600",
                fontSize: "14px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#0056b3"}
              onMouseLeave={(e) => e.target.style.background = "#007bff"}
            >
              Go to Messages
            </Link>
          </div>
        )}

        {tab === "tasks" && (
          <div style={{ padding: 20, color: "#666" }}>
            Tasks view (coming soon)
          </div>
        )}

        {tab === "members" && (
          <div style={{ padding: 20, color: "#666" }}>
            Members view (coming soon)
          </div>
        )}
      </div>
    </div>
  );
}
