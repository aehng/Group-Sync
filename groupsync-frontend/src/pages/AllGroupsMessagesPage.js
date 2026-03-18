import React, { useEffect, useState } from "react";
import { listGroups } from "../api/groups";
import MessageBoard from "../components/MessageBoard";

function normalizeGroups(data) {
  return Array.isArray(data) ? data : (data?.results || []);
}

export default function AllGroupsMessagesPage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const groupData = await listGroups();
        const groupList = normalizeGroups(groupData);

        if (!alive) return;

        setGroups(groupList);

        if (groupList.length > 0 && !selectedGroupId) {
          setSelectedGroupId(String(groupList[0].id));
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load messages.");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [selectedGroupId]);

  return (
    <div style={{ padding: 20, maxWidth: 1180, margin: "0 auto", height: "calc(100vh - 72px)" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, color: "#333" }}>All Group Messages</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Pick a group and chat in real time.
        </p>
      </div>

      {isLoading && <p style={{ color: "#666" }}>Loading your groups...</p>}
      {error && <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>}

      {!isLoading && !error && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr)",
          gap: 16,
          height: "calc(100% - 64px)",
        }}>
          <aside style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "auto",
          }}>
            <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 700 }}>
              Your Groups
            </div>

            {groups.length === 0 ? (
              <div style={{ padding: 12, color: "#666", fontSize: 14 }}>
                You are not in any groups yet.
              </div>
            ) : (
              groups.map((group) => {
                const active = String(group.id) === String(selectedGroupId);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroupId(String(group.id))}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      borderBottom: "1px solid #f3f3f3",
                      background: active ? "#e8f2ff" : "#fff",
                      color: active ? "#0056b3" : "#333",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {group.name}
                  </button>
                );
              })
            )}
          </aside>

          <section style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "hidden",
            minHeight: 0,
          }}>
            {selectedGroupId ? (
              <div style={{ height: "100%" }}>
                <MessageBoard groupId={selectedGroupId} />
              </div>
            ) : (
              <div style={{ padding: 20, color: "#666" }}>
                Select a group to start chatting.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
