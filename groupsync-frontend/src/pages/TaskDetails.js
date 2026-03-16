import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { listGroupMembers } from "../api/members";
import { deleteTask, getTask, updateTask } from "../api/tasks";
import { Error, Loading, Success } from "../components/shared";

function toLocalInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TaskDetails() {
  const { groupId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => form && form.title.trim().length > 0, [form]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [taskData, memberData] = await Promise.all([
          getTask(groupId, taskId),
          listGroupMembers(groupId),
        ]);

        setTask(taskData);
        setMembers(memberData || []);
        setForm({
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status || "todo",
          assigned_to: taskData.assigned_to || "",
          due_date: toLocalInputDateTime(taskData.due_date),
        });
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [groupId, taskId]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveChanges = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    setSuccess("");

    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    };

    try {
      const updated = await updateTask(groupId, taskId, payload);
      setTask(updated);
      setForm({
        title: updated.title || "",
        description: updated.description || "",
        status: updated.status || "todo",
        assigned_to: updated.assigned_to || "",
        due_date: toLocalInputDateTime(updated.due_date),
      });
      setIsEditing(false);
      setSuccess("Task updated.");
    } catch (err) {
      const apiErrors = err.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        setFieldErrors(apiErrors);
      }
      setError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const removeTask = async () => {
    const confirmed = window.confirm("Delete this task? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteTask(groupId, taskId);
      navigate(`/groups/${groupId}/tasks`);
    } catch (err) {
      setError(err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loading label="Loading task details..." />;
  }

  if (!task) {
    return <Error title="Task not found" message="Task data is unavailable." />;
  }

  const inputStyle = {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
  };

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, color: "#333" }}>Task Details</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/groups/${groupId}/tasks`} style={{ textDecoration: "none", color: "#0056b3", fontWeight: 700 }}>
            Back to Board
          </Link>
          {!isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={removeTask}
            disabled={isDeleting}
            style={{ border: "1px solid #d9534f", color: "#d9534f", borderRadius: 8, padding: "8px 12px", cursor: "pointer", background: "#fff" }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {success && <Success title="Saved" message={success} />}
      {error && <Error title="Task operation failed" message={error.message} />}

      {isEditing ? (
        <form onSubmit={saveChanges} style={{ display: "grid", gap: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Title</span>
            <input value={form.title} onChange={(e) => onChange("title", e.target.value)} required maxLength={200} style={inputStyle} />
            {fieldErrors.title && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.title)}</span>}
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description</span>
            <textarea value={form.description} onChange={(e) => onChange("description", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            {fieldErrors.description && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.description)}</span>}
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Status</span>
            <select value={form.status} onChange={(e) => onChange("status", e.target.value)} style={inputStyle}>
              <option value="todo">To-Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
            {fieldErrors.status && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.status)}</span>}
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Assign To</span>
            <select value={form.assigned_to} onChange={(e) => onChange("assigned_to", e.target.value)} style={inputStyle}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.username}
                </option>
              ))}
            </select>
            {fieldErrors.assigned_to && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.assigned_to)}</span>}
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Due Date</span>
            <input type="datetime-local" value={form.due_date} onChange={(e) => onChange("due_date", e.target.value)} style={inputStyle} />
            {fieldErrors.due_date && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.due_date)}</span>}
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={!canSubmit || isSaving}
              style={{ border: "none", borderRadius: 8, padding: "10px 14px", color: "#fff", background: isSaving ? "#7aa7d9" : "#007bff", cursor: "pointer", fontWeight: 700 }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFieldErrors({});
              }}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", background: "#fff", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: 16, display: "grid", gap: 8 }}>
          <div><strong>Title:</strong> {task.title}</div>
          <div><strong>Description:</strong> {task.description || "No description"}</div>
          <div><strong>Status:</strong> {task.status}</div>
          <div><strong>Due Date:</strong> {task.due_date ? new Date(task.due_date).toLocaleString() : "No due date"}</div>
          <div><strong>Assigned To:</strong> {task.assigned_to_username || "Unassigned"}</div>
          <div><strong>Created By:</strong> {task.created_by_username || "Unknown"}</div>
        </div>
      )}
    </div>
  );
}
