import React, { useEffect, useState } from "react";
import { listGroupMembers, removeGroupMember } from "../api/members";
import { Loading, Error } from "./shared";

export default function MembersList({ groupId, canRemove = false, ownerUserId = null, onMemberRemoved }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await listGroupMembers(groupId);
        if (!isMounted) return;
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  if (loading) {
    return <Loading label="Loading members..." />;
  }

  if (error) {
    return <Error title="Failed to load members" message={error.message || "Something went wrong."} />;
  }

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Members</div>
      {members.length === 0 ? (
        <p style={{ color: "#666", margin: 0 }}>No members found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {members.map((member) => {
            const isOwner = member.role === "owner";
            return (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 8,
                  background: isOwner ? "#edf7ed" : "#f9f9f9",
                  border: isOwner ? "1px solid #c3e6cb" : "1px solid transparent",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                    {member.user?.first_name || member.user?.username}
                    {isOwner ? " (Owner)" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    @{member.user?.username}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isOwner ? "#155724" : "#444",
                        background: isOwner ? "#d4edda" : "#e9ecef",
                      }}
                    >
                      {member.role}
                    </div>

                    {canRemove && member.user?.id !== ownerUserId && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Remove ${member.user?.username || "this member"} from the group?`)) {
                            return;
                          }

                          setRemovingUserId(member.user?.id || null);
                          setError(null);

                          try {
                            await removeGroupMember(groupId, member.user.id);
                            setMembers((prev) => prev.filter((m) => m.user?.id !== member.user.id));
                            if (typeof onMemberRemoved === "function") {
                              onMemberRemoved(member.user.id);
                            }
                          } catch (err) {
                            setError(err);
                          } finally {
                            setRemovingUserId(null);
                          }
                        }}
                        disabled={removingUserId === member.user?.id}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid #dc3545",
                          background: "#fff",
                          color: "#dc3545",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: removingUserId === member.user?.id ? "not-allowed" : "pointer",
                          opacity: removingUserId === member.user?.id ? 0.7 : 1,
                        }}
                      >
                        {removingUserId === member.user?.id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                    Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
