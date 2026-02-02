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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        await updateProfile(formData.username, formData.email);
    } catch (error) {
        // Handle error if needed
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <h2>Profile</h2>

      {!isEditing ? (
        <div>
          <div style={{ marginBottom: "15px" }}>
            <strong>Username:</strong> {user.username}
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong>Email:</strong> {user.email}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ marginRight: "10px" }}
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn btn-danger"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
              style={{ marginTop: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              style={{ marginTop: "5px" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginRight: "10px" }}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}