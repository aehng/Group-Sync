import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function JoinGroup() {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await api.post("/api/groups/join/", { invite_code: inviteCode });
      const group = resp.data;
      // Redirect to group details
      navigate(`/groups/${group.id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Invalid invite code. Please check and try again.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || "Failed to join group");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 8 }}>Join Group</h2>
      <p style={{ color: "#666", marginTop: 0 }}>Enter the invite code to join an existing group.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        {error && (
          <div style={{ marginBottom: 12, padding: 12, background: "#ffebee", color: "#b00020", borderRadius: 6, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#333" }}>Invite code</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC12345"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd" }}
            required
            disabled={loading}
            maxLength={8}
          />
          <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0 0" }}>Ask the group owner for the invite code.</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 14px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Joining…" : "Join Group"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: "10px 14px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
