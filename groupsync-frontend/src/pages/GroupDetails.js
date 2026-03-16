import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGroup, updateGroup, deleteGroup } from "../api/groups";
import { listGroupMembers } from "../api/members";
import { Loading, Error } from "../components/shared";

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const isOwner = Boolean(user && group && group.owner && user.id === group.owner.id);

  useEffect(() => {
    let isMounted = true;

    const fetchGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        const [groupData, membersData] = await Promise.all([
          getGroup(groupId),
          listGroupMembers(groupId),
        ]);

        if (!isMounted) return;

        setGroup(groupData);
        setMembers(Array.isArray(membersData) ? membersData : []);
        setNameDraft(groupData.name || "");
      } catch (err) {
        if (!isMounted) return;
        setError(err);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchGroup();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const handleCopyInviteCode = async () => {
    if (!group?.invite_code) return;

    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopyStatus("Copied!");
      window.setTimeout(() => setCopyStatus(""), 1500);
    } catch (err) {
      setCopyStatus("Failed to copy");
      window.setTimeout(() => setCopyStatus(""), 1500);
    }
  };

  const handleSave = async () => {
    if (!group) return;
    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateGroup(groupId, { name: nameDraft });
      setGroup(updated);
      setEditMode(false);
    } catch (err) {
      setError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!group) return;

    if (!window.confirm("Are you sure you want to delete this group? This cannot be undone.")) {
      return;
    }

    try {
      await deleteGroup(groupId);
      navigate("/groups");
    } catch (err) {
      setError(err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <Loading label="Loading group details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <Error title="Failed to load group" message={error.message || "Something went wrong."} />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{group.name}</h2>

            <button
              onClick={handleCopyInviteCode}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                cursor: "pointer",
                borderRadius: 6,
                border: "1px solid #007bff",
                background: "#fff",
                color: "#007bff",
                fontWeight: 600,
              }}
            >
              Copy invite code
            </button>

            {copyStatus && <span style={{ color: "#1976d2", fontSize: 13 }}>{copyStatus}</span>}
          </div>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ color: "#666", fontSize: 14 }}>
              <strong>Owner:</strong> {group.owner?.username ?? "—"}
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>
              <strong>Invite code:</strong> <span style={{ fontFamily: "monospace" }}>{group.invite_code}</span>
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>
              <strong>Members:</strong> {group.member_count ?? members.length}
            </div>
          </div>

          {editMode ? (
            <div style={{ marginTop: 16, maxWidth: 420 }}>
              <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>
                Group name
              </label>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !nameDraft.trim()}
                  style={{
                    padding: "8px 14px",
                    background: "#007bff",
                    color: "#fff",
                    borderRadius: 6,
                    border: "none",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setNameDraft(group.name || "");
                    setError(null);
                  }}
                  style={{
                    padding: "8px 14px",
                    background: "#f0f0f0",
                    color: "#333",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            isOwner && (
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    padding: "8px 14px",
                    background: "#007bff",
                    color: "#fff",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "8px 14px",
                    background: "#dc3545",
                    color: "#fff",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
              </div>
            )
          )}

          <div style={{ marginTop: 20 }}>
            <Link
              to={`/groups/${groupId}/messages`}
              style={{
                padding: "10px 14px",
                background: "#007bff",
                color: "#fff",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              Go to workspace
            </Link>
          </div>
        </div>

        <div style={{ minWidth: 280, maxWidth: 340 }}>
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10, background: "#fff" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Members</div>
            {members.length === 0 ? (
              <p style={{ color: "#666", margin: 0 }}>No members found.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 10,
                      borderRadius: 8,
                      background: "#f9f9f9",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                        {member.user?.first_name || member.user?.username}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        @{member.user?.username}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        color: member.role === "owner" ? "#155724" : "#444",
                        background: member.role === "owner" ? "#d4edda" : "#e9ecef",
                      }}
                    >
                      {member.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
