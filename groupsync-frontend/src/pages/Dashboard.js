import React from "react";
import { Link } from "react-router-dom";

const mockGroups = [
  { id: 1, name: "Alpha Team" },
  { id: 2, name: "Beta Squad" },
];

export default function Dashboard() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <p>Your groups:</p>
      <ul>
        {mockGroups.map((g) => (
          <li key={g.id}>
            <Link to={`/groups/${g.id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
