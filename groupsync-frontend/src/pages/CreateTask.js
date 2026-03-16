import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { listGroupMembers } from "../api/members";
import { createTask } from "../api/tasks";
import { Error, Success } from "../components/shared";

const initialForm = {
  title: "",
  description: "",
  assigned_to: "",
  due_date: "",
};

export default function CreateTask() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await listGroupMembers(groupId);
        setMembers(data || []);
      } catch (err) {
        setError(err);
      }
    };

    loadMembers();
  }, [groupId]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess("");
    setIsSubmitting(true);

    const payload = {
      title: form.title,
      description: form.description,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    };

    try {
      const created = await createTask(groupId, payload);
      setSuccess("Task created successfully.");
      setForm(initialForm);
      setTimeout(() => {
        navigate(`/groups/${groupId}/tasks/${created.id}`);
      }, 500);
    } catch (err) {
      const apiErrors = err.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        setFieldErrors(apiErrors);
      }
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
  };

  return (
    <div style={{ maxWidth: 760, margin: "20px auto", padding: 20, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "#333" }}>Create Task</h2>
        <Link to={`/groups/${groupId}/tasks`} style={{ textDecoration: "none", color: "#0056b3", fontWeight: 600 }}>
          Back to Board
        </Link>
      </div>

      {success && <Success title="Success" message={success} />}
      {error && <Error title="Could not create task" message={error.message} />}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            required
            maxLength={200}
            style={inputStyle}
          />
          {fieldErrors.title && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.title)}</span>}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          {fieldErrors.description && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.description)}</span>}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Assign To</span>
          <select
            value={form.assigned_to}
            onChange={(e) => onChange("assigned_to", e.target.value)}
            style={inputStyle}
          >
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
          <input
            type="datetime-local"
            value={form.due_date}
            onChange={(e) => onChange("due_date", e.target.value)}
            style={inputStyle}
          />
          {fieldErrors.due_date && <span style={{ color: "#b00020", fontSize: 12 }}>{String(fieldErrors.due_date)}</span>}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            color: "#fff",
            background: isSubmitting ? "#7aa7d9" : "#007bff",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
