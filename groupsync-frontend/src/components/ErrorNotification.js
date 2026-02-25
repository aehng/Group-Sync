import React from "react";

/**
 * Reusable error notification component
 * Handles general errors, field errors, and HTTP status codes
 */
export default function ErrorNotification({ error, fieldErrors = {} }) {
  if (!error && Object.keys(fieldErrors).length === 0) {
    return null;
  }

  // Get user-friendly message based on error type
  const getUserFriendlyMessage = (error) => {
    if (!error) return null;

    // Check if it's a network error
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please check your connection and try again.";
    }
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      return "Network error. Please check your internet connection.";
    }

    // Check HTTP status codes
    const status = error.response?.status;
    if (status === 404) {
      return "Resource not found. Please verify the request.";
    }
    if (status === 500) {
      return "Server error. Please try again later.";
    }
    if (status === 503) {
      return "Service unavailable. Please try again later.";
    }

    // Return the extracted message
    return error.message || error;
  };

  const errorMessage = getUserFriendlyMessage(error);

  return (
    <div style={{
      background: "#ffebee",
      border: "1px solid #ef5350",
      color: "#d32f2f",
      padding: "16px",
      borderRadius: "6px",
      fontSize: "14px",
      marginBottom: "16px"
    }}>
      {/* General error message */}
      {errorMessage && (
        <div style={{ marginBottom: Object.keys(fieldErrors).length > 0 ? "12px" : 0 }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Field-specific errors */}
      {Object.keys(fieldErrors).length > 0 && (
        <div>
          <strong>Issues:</strong>
          <ul style={{
            margin: "8px 0 0 20px",
            paddingLeft: "0"
          }}>
            {Object.entries(fieldErrors).map(([field, messages]) => {
              const messageList = Array.isArray(messages) ? messages : [messages];
              return messageList.map((msg, idx) => (
                <li key={`${field}-${idx}`} style={{ marginBottom: "4px" }}>
                  <strong>{formatFieldName(field)}:</strong> {String(msg).toLowerCase()}
                </li>
              ));
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Convert field names like "password_confirm" to "Password Confirm"
 */
function formatFieldName(fieldName) {
  return fieldName
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
