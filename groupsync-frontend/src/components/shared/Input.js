import React from "react";

export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
  validationState = "default", // default | error | success
  helperText,
  errorText,
  successText,
}) {
  const inputClass = [
    "input",
    validationState === "error" && "input-error",
    validationState === "success" && "input-success",
  ]
    .filter(Boolean)
    .join(" ");

  let helper = helperText;
  let helperClass = "helper";

  if (validationState === "error" && errorText) {
    helper = errorText;
    helperClass = "helper helper-error";
  }

  if (validationState === "success" && successText) {
    helper = successText;
    helperClass = "helper helper-success";
  }

  return (
    <div className="field">
      {label && (
        <label className="label" htmlFor={name}>
          {label} {required && "*"}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        className={inputClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={validationState === "error"}
      />

      {helper && <small className={helperClass}>{helper}</small>}
    </div>
  );
}
