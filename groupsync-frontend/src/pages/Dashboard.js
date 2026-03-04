import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listGroups } from "../api/groups";
import { Loading, Error } from "../components/shared";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listGroups();
        setGroups(data.results || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 20, maxWidth: 800 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 8 }}>
          Dashboard
        </h2>
        <Loading label="Loading your groups..." />
      </div>
    );
  }

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

      {error && (
        <Error title="Failed to load groups" message={error.message || "Please try again."} />
      )}

      {groups.length === 0 ? (
        <div style={{
          padding: 32,
          textAlign: "center",
          background: "#f5f5f5",
          borderRadius: 8,
          color: "#666"
        }}>
          <p style={{ marginBottom: 16 }}>You haven't joined any groups yet.</p>
          <p style={{ fontSize: 14 }}>Create a group or ask for an invite code to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {groups.map((group) => (
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
                {group.description || "No description"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
