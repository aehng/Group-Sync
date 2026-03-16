import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listGroupMembers } from "../api/members";
import { listGroupTasks, updateTaskStatus } from "../api/tasks";
import TaskCard from "../components/TaskCard";
import { Error, Loading } from "../components/shared";

const STATUSES = ["todo", "doing", "done"];

const STATUS_TITLES = {
  todo: "To-Do",
  doing: "Doing",
  done: "Done",
};

export default function TaskBoard() {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    assigned_to: "",
    due_before: "",
    ordering: "-created_at",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);

  const queryFilters = useMemo(() => {
    const next = { ...filters };
    if (next.due_before) {
      next.due_before = new Date(next.due_before).toISOString();
    }
    return next;
  }, [filters]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [taskData, memberData] = await Promise.all([
        listGroupTasks(groupId, queryFilters),
        listGroupMembers(groupId),
      ]);
      setTasks(taskData.results || taskData || []);
      setMembers(memberData || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, queryFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedTasks = useMemo(() => {
    const grouped = { todo: [], doing: [], done: [] };
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const handleStatusChange = async (task, status) => {
    if (task.status === status) return;

    const previous = tasks;
    const optimistic = tasks.map((item) =>
      item.id === task.id ? { ...item, status } : item
    );
    setTasks(optimistic);

    try {
      const updated = await updateTaskStatus(groupId, task.id, status);
      setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));
    } catch (err) {
      setTasks(previous);
      setError(err);
    }
  };

  const handleDrop = async (status) => {
    if (!draggingTask) return;
    const taskToMove = draggingTask;
    setDraggingTask(null);
    await handleStatusChange(taskToMove, status);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <Loading label="Loading task board..." />;
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, color: "#333" }}>Task Board</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            to={`/groups/${groupId}`}
            style={{ textDecoration: "none", color: "#0056b3", fontWeight: 600, padding: "8px 12px" }}
          >
            Back to Workspace
          </Link>
          <Link
            to={`/groups/${groupId}/tasks/new`}
            style={{ textDecoration: "none", color: "#fff", background: "#007bff", borderRadius: 8, padding: "8px 12px", fontWeight: 700 }}
          >
            Create Task
          </Link>
        </div>
      </div>

      {error && <Error title="Task board error" message={error.message} />}

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To-Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>

        <select value={filters.assigned_to} onChange={(e) => handleFilterChange("assigned_to", e.target.value)}>
          <option value="">All Assignees</option>
          {members.map((member) => (
            <option key={member.user.id} value={member.user.id}>
              {member.user.username}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={filters.due_before}
          onChange={(e) => handleFilterChange("due_before", e.target.value)}
        />

        <select value={filters.ordering} onChange={(e) => handleFilterChange("ordering", e.target.value)}>
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
          <option value="due_date">Due Date Asc</option>
          <option value="-due_date">Due Date Desc</option>
        </select>

        <button
          type="button"
          onClick={loadData}
          style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}
        >
          Apply Filters
        </button>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {STATUSES.map((status) => (
          <section
            key={status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(status)}
            style={{ background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 10, padding: 12 }}
          >
            <h3 style={{ marginTop: 0, color: "#333" }}>
              {STATUS_TITLES[status]} ({groupedTasks[status].length})
            </h3>
            <div style={{ display: "grid", gap: 10 }}>
              {groupedTasks[status].length === 0 ? (
                <div style={{ color: "#777", fontSize: 14 }}>No tasks in this column.</div>
              ) : (
                groupedTasks[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    groupId={groupId}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDragStart={setDraggingTask}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
