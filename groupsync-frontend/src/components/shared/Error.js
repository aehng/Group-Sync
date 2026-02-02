import React from "react";

export default function Error({ title = "Something went wrong", message = "" }) {
  return (
    <div className="alert alert-error" role="alert">
      <div>
        <p className="alert-title">{title}</p>
        {message ? <p className="alert-text">{message}</p> : null}
      </div>
    </div>
  );
}
