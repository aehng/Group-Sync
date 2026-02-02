import React from "react";

export default function Card({
  title,
  subtitle,
  compact = false,
  children,
}) {
  return (
    <section className={`card ${compact ? "card-compact" : ""}`}>
      {(title || subtitle) && (
        <header className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </header>
      )}

      <div className="card-body">{children}</div>
    </section>
  );
}
