import React from "react";
import { Link } from "react-router-dom";

const STATUS_LABELS = {
  todo: "To-Do",
  doing: "Doing",
  done: "Done",
};

const STATUS_COLORS = {
  todo: { bg: "#fff3cd", text: "#856404" },
  doing: { bg: "#d1ecf1", text: "#0c5460" },
  done: { bg: "#d4edda", text: "#155724" },
};

function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid due date";
  return date.toLocaleString();
}

export default function TaskCard({
  groupId,
  task,
  canUpdateStatus = true,
  onStatusChange,
  onDragStart,
}) {
  const colors = STATUS_COLORS[task.status] || STATUS_COLORS.todo;

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(task)}
      style={{
        padding: 14,
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #ddd",
        display: "grid",
        gap: 10,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, color: "#333", marginBottom: 4 }}>{task.title}</div>
        {task.description && (
          <div style={{ color: "#666", fontSize: 13, lineHeight: 1.4 }}>{task.description}</div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span
          style={{
            background: colors.bg,
            color: colors.text,
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          {STATUS_LABELS[task.status] || task.status}
        </span>
        <span style={{ color: "#666", fontSize: 12 }}>Due: {formatDueDate(task.due_date)}</span>
        <span style={{ color: "#666", fontSize: 12 }}>
          Assigned: {task.assigned_to_username || "Unassigned"}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link
          to={`/groups/${groupId}/tasks/${task.id}`}
          style={{
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            color: "#0056b3",
            padding: "6px 10px",
            border: "1px solid #cfe2ff",
            borderRadius: 8,
            background: "#f2f7ff",
          }}
        >
          View Details
        </Link>

        {canUpdateStatus && (
          <>
            <button
              type="button"
              onClick={() => onStatusChange?.(task, "todo")}
              disabled={task.status === "todo"}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
            >
              To-Do
            </button>
            <button
              type="button"
              onClick={() => onStatusChange?.(task, "doing")}
              disabled={task.status === "doing"}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
            >
              Doing
            </button>
            <button
              type="button"
              onClick={() => onStatusChange?.(task, "done")}
              disabled={task.status === "done"}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
