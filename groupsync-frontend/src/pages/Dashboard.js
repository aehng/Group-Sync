import React from "react";
import { Link } from "react-router-dom";

const mockGroups = [
  { id: 1, name: "Alpha Team", description: "Development team" },
  { id: 2, name: "Beta Squad", description: "QA team" },
];

export default function Dashboard() {
  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 8 }}>
          Dashboard
        </h2>
        <p style={{ color: "#666", fontSize: 14 }}>
          Select a group to view messages and collaborate with your team.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {mockGroups.map((group) => (
          <Link
            key={group.id}
            to={`/groups/${group.id}`}
            style={{
              display: "block",
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
              background: "#fff",
              textDecoration: "none",
              transition: "all 0.2s",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#007bff";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#ddd";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 6 }}>
              {group.name}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              {group.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
