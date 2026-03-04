import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { listGroupTasks } from "../api/tasks";
import { listGroupMembers } from "../api/members";
import { getGroup } from "../api/groups";
import { Loading, Error } from "../components/shared";

export default function GroupWorkspace() {
  const { groupId } = useParams();
  const [tab, setTab] = useState("messages");
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
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
                transition: "background 0.2s",
                border: "none",
                cursor: "pointer",
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
