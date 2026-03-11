import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get("/api/groups/");
        if (isMounted) setGroups(resp.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load groups");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#333", margin: 0 }}>My Groups</h2>
          <p style={{ color: "#666", margin: "6px 0 0 0", fontSize: 14 }}>Groups you belong to.</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/groups/create" style={{ padding: "8px 12px", background: "#007bff", color: "#fff", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>Create</Link>
          <Link to="/groups/join" style={{ padding: "8px 12px", background: "#6c757d", color: "#fff", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>Join</Link>
        </div>
      </div>

      {loading && <p style={{ color: "#666" }}>Loading groups…</p>}

      {error && (
        <div style={{ marginBottom: 12, color: "#b00020" }}>
          Error: {error}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div style={{ padding: 20, border: "1px dashed #ddd", borderRadius: 8, background: "#fff" }}>
          <p style={{ margin: 0, color: "#666" }}>You are not a member of any groups yet.</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {groups.map((group) => {
          const owner = group.owner && (typeof group.owner === "object" ? group.owner.username || group.owner.email || group.owner.id : group.owner);
          const memberCount = group.member_count ?? group.members_count ?? group.members?.length ?? "—";

          return (
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
                color: "inherit",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 6 }}>{group.name}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    Owner: {owner ?? "—"} • Members: {memberCount}
                  </div>
                </div>

                <div>
                  <button
                    style={{
                      padding: "8px 12px",
                      background: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                    onClick={(e) => {
                      // Prevent Link navigation so button can control behavior if needed
                      e.preventDefault();
                      window.location.href = `/groups/${group.id}`;
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
