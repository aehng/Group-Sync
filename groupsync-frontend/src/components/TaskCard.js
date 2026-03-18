import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./shared";

const STATUS_LABELS = {
  todo: "To-Do",
  doing: "Doing",
  done: "Done",
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
  const badgeClass = task.status === "todo" ? "badge--task" : "badge--meeting";

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(task)}
      className="card"
      style={{ display: "grid", gap: 10 }}
    >
      <div>
        <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>{task.title}</div>
        {task.description && (
          <div style={{ color: "var(--color-muted)", fontSize: 13, lineHeight: 1.4 }}>{task.description}</div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span className={`badge ${badgeClass}`}>
          {STATUS_LABELS[task.status] || task.status}
        </span>
        <span style={{ color: "var(--color-muted)", fontSize: 12 }}>Due: {formatDueDate(task.due_date)}</span>
        <span style={{ color: "var(--color-muted)", fontSize: 12 }}>
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
            color: "var(--color-primary)",
            padding: "6px 10px",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-bg)",
          }}
        >
          View Details
        </Link>

        {canUpdateStatus && (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onStatusChange?.(task, "todo")}
              disabled={task.status === "todo"}
            >
              To-Do
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onStatusChange?.(task, "doing")}
              disabled={task.status === "doing"}
            >
              Doing
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onStatusChange?.(task, "done")}
              disabled={task.status === "done"}
            >
              Done
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
