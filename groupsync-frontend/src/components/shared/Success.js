import React from "react";

export default function Success({ title = "Success", message = "" }) {
  return (
    <div className="alert alert-success" role="status" aria-live="polite">
      <div>
        <p className="alert-title">{title}</p>
        {message ? <p className="alert-text">{message}</p> : null}
      </div>
    </div>
  );
}
