import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const resp = await api.post("/api/groups/", { name });
      const group = resp.data;
      // Redirect to group details
      navigate(`/groups/${group.id}`);
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: [err.message || "Failed to create group"] });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = () => {
    if (!errors) return null;
    // If field errors (e.g., name), show them; otherwise show first non-field
    if (errors.name) return <div style={{ color: "#b00020", marginBottom: 8 }}>{errors.name[0]}</div>;
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey])) {
      return <div style={{ color: "#b00020", marginBottom: 8 }}>{errors[firstKey][0]}</div>;
    }
    return <div style={{ color: "#b00020", marginBottom: 8 }}>Error creating group</div>;
  };

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 8 }}>Create Group</h2>
      <p style={{ color: "#666", marginTop: 0 }}>Provide a name for your new group.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        {renderError()}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#333" }}>Group name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Engineering Team"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd" }}
            required
            disabled={loading}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 14px", background: "#007bff", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600 }}
          >
            {loading ? "Creating…" : "Create Group"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: "10px 14px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: 6 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
