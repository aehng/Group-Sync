import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listGroups } from "../api/groups";
import { listGroupMeetings } from "../api/meetings";
import { listGroupTasks } from "../api/tasks";

function normalizeGroups(data) {
  return Array.isArray(data) ? data : (data?.results || []);
}

function toTimelineRows(groups, meetingsByGroup, tasksByGroup) {
  const rows = [];

  groups.forEach((group) => {
    const meetings = meetingsByGroup[group.id] || [];
    meetings.forEach((meeting) => {
      rows.push({
        type: "meeting",
        id: `meeting-${group.id}-${meeting.id}`,
        groupId: group.id,
        groupName: group.name,
        title: meeting.title,
        subtitle: meeting.location_or_link || "No location",
        when: meeting.start_time,
        raw: meeting,
      });
    });

    const tasks = tasksByGroup[group.id] || [];
    tasks.forEach((task) => {
      if (!task.due_date) return;
      rows.push({
        type: "task",
        id: `task-${group.id}-${task.id}`,
        groupId: group.id,
        groupName: group.name,
        title: task.title,
        subtitle: task.priority ? `Priority: ${task.priority}` : "Task due",
        when: task.due_date,
        raw: task,
      });
    });
  });

  rows.sort((a, b) => new Date(a.when) - new Date(b.when));
  return rows;
}

export default function AllGroupsCalendarPage() {
  const [groups, setGroups] = useState([]);
  const [meetingsByGroup, setMeetingsByGroup] = useState({});
  const [tasksByGroup, setTasksByGroup] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const timeline = useMemo(
    () => toTimelineRows(groups, meetingsByGroup, tasksByGroup),
    [groups, meetingsByGroup, tasksByGroup]
  );

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

        const nowIso = new Date().toISOString();

        const [meetingPairs, taskPairs] = await Promise.all([
          Promise.all(
            groupList.map(async (group) => {
              try {
                const meetings = await listGroupMeetings(group.id, { upcoming: true });
                return [group.id, Array.isArray(meetings) ? meetings : []];
              } catch {
                return [group.id, []];
              }
            })
          ),
          Promise.all(
            groupList.map(async (group) => {
              try {
                const tasks = await listGroupTasks(group.id, {
                  due_after: nowIso,
                  ordering: "due_date",
                });
                return [group.id, Array.isArray(tasks) ? tasks : []];
              } catch {
                return [group.id, []];
              }
            })
          ),
        ]);

        if (!alive) return;

        setMeetingsByGroup(Object.fromEntries(meetingPairs));
        setTasksByGroup(Object.fromEntries(taskPairs));
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load calendar data.");
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, color: "#333" }}>Calendar</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Upcoming meetings and task deadlines across all your groups.
        </p>
      </div>

      {isLoading && <p style={{ color: "#666" }}>Loading calendar...</p>}
      {error && <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>}

      {!isLoading && !error && timeline.length === 0 && (
        <div className="card" style={{ border: "1px dashed #ccc" }}>
          No upcoming meetings or task deadlines found.
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {timeline.map((item) => (
          <div key={item.id} className="card card-clickable">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className={
                    item.type === "meeting" ? "badge badge--meeting" : "badge badge--task"
                  }
                >
                  {item.type}
                </span>
                <strong style={{ color: "#333" }}>{item.title}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
                {item.when ? new Date(item.when).toLocaleString() : "No date"}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
              {item.subtitle}
            </div>

            <div style={{ fontSize: 13, color: "#555" }}>
              Group: <strong>{item.groupName}</strong>
            </div>

            <div style={{ marginTop: 8 }}>
              <Link
                to={
                  item.type === "meeting"
                    ? `/groups/${item.groupId}/meetings/${item.raw.id}`
                    : `/groups/${item.groupId}/tasks/${item.raw.id}`
                }
                style={{ color: "#007bff", textDecoration: "none", fontWeight: 600, fontSize: 13 }}
              >
                Open {item.type}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
