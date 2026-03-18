import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { listGroupTasks } from "../api/tasks";
import { listGroupMembers, removeGroupMember } from "../api/members";
import { getGroup } from "../api/groups";
import MessageBoard from "../components/MessageBoard";
import { useAuth } from "../context/AuthContext";
import { Loading, Error } from "../components/shared";

export default function GroupWorkspace() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("messages");
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [isLoading, setIsLoading] = useState({
    group: true,
    tasks: false,
    members: false,
  });
  const [errors, setErrors] = useState({
    group: null,
    tasks: null,
    members: null,
  });

  // Fetch group info
  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading((prev) => ({ ...prev, group: true }));
      setErrors((prev) => ({ ...prev, group: null }));
      try {
        const data = await getGroup(groupId);
        setGroup(data);
      } catch (err) {
        setErrors((prev) => ({ ...prev, group: err }));
      } finally {
        setIsLoading((prev) => ({ ...prev, group: false }));
      }
    };

    fetchGroup();
  }, [groupId]);

  const isOwner = Boolean(user?.id && group?.owner?.id && user.id === group.owner.id);

  // Fetch tasks when tab changes to "tasks"
  useEffect(() => {
    if (tab !== "tasks") return;

    const fetchTasks = async () => {
      setIsLoading((prev) => ({ ...prev, tasks: true }));
      setErrors((prev) => ({ ...prev, tasks: null }));
      try {
        const data = await listGroupTasks(groupId);
        setTasks(data.results || data || []);
      } catch (err) {
        setErrors((prev) => ({ ...prev, tasks: err }));
      } finally {
        setIsLoading((prev) => ({ ...prev, tasks: false }));
      }
    };

    fetchTasks();
  }, [tab, groupId]);

  // Fetch members when tab changes to "members"
  useEffect(() => {
    if (tab !== "members") return;

    const fetchMembers = async () => {
      setIsLoading((prev) => ({ ...prev, members: true }));
      setErrors((prev) => ({ ...prev, members: null }));
      try {
        const data = await listGroupMembers(groupId);
        setMembers(data || []);
      } catch (err) {
        setErrors((prev) => ({ ...prev, members: err }));
      } finally {
        setIsLoading((prev) => ({ ...prev, members: false }));
      }
    };

    fetchMembers();
  }, [tab, groupId]);

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

  if (isLoading.group) {
    return (
      <div style={{ padding: 20 }}>
        <Loading label="Loading group..." />
      </div>
    );
  }

  if (errors.group) {
    return (
      <div style={{ padding: 20 }}>
        <Error title="Failed to load group" message={errors.group.message} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      <div style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid #eee",
        background: "#fff"
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#333", margin: "0 0 4px 0" }}>
          {group?.name || `Group ${groupId}`}
        </h2>
        {group?.description && (
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
            {group.description}
          </p>
        )}
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
        <button 
          onClick={() => setTab("details")}
          style={tabStyle(tab === "details")}
        >
          Details
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: tab === "messages" ? "hidden" : "auto", background: "#f5f5f5" }}>
        {tab === "messages" && (
          <div style={{ height: "100%", minHeight: 0 }}>
            <MessageBoard groupId={groupId} />
          </div>
        )}

        {tab === "tasks" && (
          <div style={{ padding: 20, color: "#666" }}>
            <div style={{ marginBottom: 16 }}>
              <Link
                to={`/groups/${groupId}/tasks`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  background: "#007bff",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 6,
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Open Task Board
              </Link>
            </div>
            {errors.tasks && (
              <Error title="Failed to load tasks" message={errors.tasks.message} />
            )}
            {isLoading.tasks ? (
              <Loading label="Loading tasks..." />
            ) : tasks.length === 0 ? (
              <p style={{ color: "#666" }}>No tasks yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: 16,
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #ddd"
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 6 }}>
                      {task.title || task.name}
                    </div>
                    {(task.description || task.detail) && (
                      <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                        {task.description || task.detail}
                      </p>
                    )}
                    {task.status && (
                      <div style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        background: task.status === "completed" ? "#d4edda" : "#fff3cd",
                        color: task.status === "completed" ? "#155724" : "#856404",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {task.status}
                      </div>
                    )}
                    {task.assigned_to && (
                      <p style={{ fontSize: 12, color: "#999", marginTop: 8, marginBottom: 0 }}>
                        Assigned to: {task.assigned_to.first_name || task.assigned_to.username}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "members" && (
          <div style={{ padding: 20, color: "#666" }}>
            {errors.members && (
              <Error title="Failed to load members" message={errors.members.message} />
            )}
            {isLoading.members ? (
              <Loading label="Loading members..." />
            ) : members.length === 0 ? (
              <p style={{ color: "#666" }}>No members found.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: 16,
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 4 }}>
                        {member.user.first_name || member.user.username}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        @{member.user.username}
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <div style={{
                        padding: "6px 12px",
                        background: member.role === "owner" ? "#e3f2fd" : "#f0f0f0",
                        color: member.role === "owner" ? "#1976d2" : "#666",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        textTransform: "capitalize"
                      }}>
                        {member.role}
                      </div>

                      {isOwner && member.user?.id !== group?.owner?.id && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Remove ${member.user?.username || "this member"} from the group?`)) {
                              return;
                            }

                            setRemovingMemberId(member.user?.id || null);
                            setErrors((prev) => ({ ...prev, members: null }));

                            try {
                              await removeGroupMember(groupId, member.user.id);
                              setMembers((prev) => prev.filter((m) => m.user?.id !== member.user.id));
                              setGroup((prev) => {
                                if (!prev) return prev;
                                const currentCount = Number(prev.member_count ?? 0);
                                return {
                                  ...prev,
                                  member_count: Math.max(0, currentCount - 1),
                                };
                              });
                            } catch (err) {
                              setErrors((prev) => ({ ...prev, members: err }));
                            } finally {
                              setRemovingMemberId(null);
                            }
                          }}
                          disabled={removingMemberId === member.user?.id}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 4,
                            border: "1px solid #dc3545",
                            background: "#fff",
                            color: "#dc3545",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: removingMemberId === member.user?.id ? "not-allowed" : "pointer",
                            opacity: removingMemberId === member.user?.id ? 0.7 : 1,
                          }}
                        >
                          {removingMemberId === member.user?.id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "details" && (
          <div style={{ padding: 20, color: "#333" }}>
            <div style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              maxWidth: 680,
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Group Details</h3>

              <div style={{ display: "grid", gap: 8 }}>
                <div><strong>Name:</strong> {group?.name || "-"}</div>
                <div><strong>Owner:</strong> {group?.owner?.username || "-"}</div>
                <div><strong>Invite code:</strong> <span style={{ fontFamily: "monospace" }}>{group?.invite_code || "-"}</span></div>
                <div><strong>Members:</strong> {group?.member_count ?? "-"}</div>
              </div>

              <div style={{ marginTop: 16 }}>
                <Link
                  to={`/groups/${groupId}/details`}
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    background: "#007bff",
                    color: "#fff",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Open Full Group Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
