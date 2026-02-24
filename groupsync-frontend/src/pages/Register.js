// base created with ai

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const { register, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault();

     // Frontend validation (quick feedback)
  if (password.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }
    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    setFormErrors({});

    // Send to backend for final validation
    try {
      await register(username, email, password, passwordConfirm);
      navigate("/profile"); // Redirect to profile after successful registration
    } catch (err) {
      // Error is handled by AuthContext
      setFormErrors(err.response?.data || { general: "Registration failed" });
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f5",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        background: "#fff",
        padding: "32px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ 
          fontSize: "24px",
          fontWeight: "700",
          color: "#333",
          marginBottom: "24px",
          textAlign: "center"
        }}>
          Register
        </h2>

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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
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

          <div style={{ marginBottom: "16px" }}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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

          <div style={{ marginBottom: "16px" }}>
            <label 
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
                marginBottom: "6px"
              }}
            >
              Password (min 8 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              htmlFor="passwordConfirm"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
                marginBottom: "6px"
              }}
            >
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
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

          {error && (
            <div style={{
              background: "#ffebee",
              color: "#d32f2f",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "14px",
              marginBottom: "16px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "default" : "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#0056b3")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#007bff")}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{
          marginTop: "16px",
          textAlign: "center",
          fontSize: "14px",
          color: "#666"
        }}>
          Already have an account?{" "}
          <a 
            href="/login"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "600"
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}