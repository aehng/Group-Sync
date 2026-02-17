import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function GroupWorkspace() {
  const { groupId } = useParams();
  const [tab, setTab] = useState("messages");

  return (
    <div style={{ padding: 16 }}>
      <h2>Group Workspace — {groupId}</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setTab("messages")} style={{ marginRight: 8 }}>
          Messages
        </button>
        <button onClick={() => setTab("tasks")} style={{ marginRight: 8 }}>
          Tasks
        </button>
        <button onClick={() => setTab("members")}>
          Members
        </button>
      </div>

      <div>
        {tab === "messages" && (
          <div>
            <p>
              Open the messaging page: <Link to={`/groups/${groupId}/messages`}>Messages</Link>
            </p>
          </div>
        )}

        {tab === "tasks" && <div>Tasks view (placeholder)</div>}
        {tab === "members" && <div>Members view (placeholder)</div>}
      </div>
    </div>
  );
}
