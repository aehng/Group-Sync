// base created with ai

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout, loading, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      console.log("Profile handleSubmit: calling updateProfile");
      await updateProfile(formData.username, formData.email);
      console.log("Profile handleSubmit: updateProfile succeeded");
      setIsEditing(false);
    } catch (error) {
      console.log("Profile handleSubmit: caught error", error);
      setFormErrors(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>Loading...</div>;
  }

  const buttonStyle = (variant = "primary") => {
    const baseStyle = {
      padding: "10px 16px",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      marginRight: "8px"
    };
    
    const variants = {
      primary: {
        ...baseStyle,
        background: "#007bff",
        color: "#fff"
      },
      secondary: {
        ...baseStyle,
        background: "#f5f5f5",
        color: "#333",
        border: "1px solid #ddd"
      },
      danger: {
        ...baseStyle,
        background: "#d32f2f",
        color: "#fff"
      }
    };
    
    return variants[variant] || variants.primary;
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#f5f5f5",
      padding: "32px 20px"
    }}>
      <div style={{
        maxWidth: "500px",
        margin: "0 auto",
        background: "#fff",
        padding: "32px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ 
          fontSize: "24px",
          fontWeight: "700",
          color: "#333",
          marginBottom: "24px"
        }}>
          Profile
        </h2>

        {!isEditing ? (
          <div>
            <div style={{
              background: "#f9f9f9",
              padding: "16px",
              borderRadius: "6px",
              marginBottom: "20px"
            }}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#999", display: "block", marginBottom: "4px" }}>
                  Username
                </label>
                <p style={{ fontSize: "16px", color: "#333", margin: 0 }}>
                  {user.username}
                </p>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#999", display: "block", marginBottom: "4px" }}>
                  Email
                </label>
                <p style={{ fontSize: "16px", color: "#333", margin: 0 }}>
                  {user.email}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsEditing(true)}
                style={buttonStyle("secondary")}
                onMouseEnter={(e) => {
                  e.target.style.background = "#efefef";
                  e.target.style.borderColor = "#bbb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f5f5f5";
                  e.target.style.borderColor = "#ddd";
                }}
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                style={{
                  ...buttonStyle("danger"),
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "default" : "pointer"
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = "#b71c1c")}
                onMouseLeave={(e) => !loading && (e.target.style.background = "#d32f2f")}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label 
                htmlFor="username"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "6px"
                }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#007bff"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label 
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "6px"
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#007bff"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                style={buttonStyle("primary")}
                onMouseEnter={(e) => e.target.style.background = "#0056b3"}
                onMouseLeave={(e) => e.target.style.background = "#007bff"}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={buttonStyle("secondary")}
                onMouseEnter={(e) => {
                  e.target.style.background = "#efefef";
                  e.target.style.borderColor = "#bbb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f5f5f5";
                  e.target.style.borderColor = "#ddd";
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}