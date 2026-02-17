import React from "react";
import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 16 }}>
      <Link to="/">Dashboard</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/groups/1">Group Workspace (example)</Link>
    </nav>
  );
}
