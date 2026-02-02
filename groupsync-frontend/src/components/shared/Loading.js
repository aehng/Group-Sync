import React from "react";

export default function Loading({ label = "Loading…" }) {
  return (
    <div className="loading-row" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

