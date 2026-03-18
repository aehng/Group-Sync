import React from "react";

export default function Card({
  title,
  subtitle,
  compact = false,
  children,
  className = "",
  onClick,
  style,
  ...props
}) {
  const classes = ["card", compact && "card-compact", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} onClick={onClick} style={style} {...props}>
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
