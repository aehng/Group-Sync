import React from "react";

export default function Button({
  children,
  variant = "primary", // primary | secondary | danger | ghost
  size = "md",         // sm | md | lg
  block = false,
  type = "button",
  disabled = false,
  onClick,
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size !== "md" && `btn-${size}`,
    block && "btn-block",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
