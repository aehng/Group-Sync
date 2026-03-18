import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navStyle = {
    padding: "12px 20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    gap: 24,
    background: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    fontSize: 14
  };

  const linkStyle = (active) => ({
    textDecoration: "none",
    color: active ? "#007bff" : "#666",
    fontWeight: active ? "600" : "500",
    borderBottom: active ? "2px solid #007bff" : "none",
    paddingBottom: active ? "10px" : "12px",
    transition: "color 0.2s"
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle(isActive("/"))}>
        Dashboard
      </Link>
      <Link to="/groups" style={linkStyle(isActive("/groups"))}>
        Groups
      </Link>
      <Link to="/messages" style={linkStyle(isActive("/messages"))}>
        Messages
      </Link>
      <Link to="/profile" style={linkStyle(isActive("/profile"))}>
        Profile
      </Link>
    </nav>
  );
}
