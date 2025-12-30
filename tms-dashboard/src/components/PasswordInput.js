"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import TextInput from "@/components/TextInput";

export default function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
  disabled,
  required,
  error,
  helpText,
  ariaLabelShow,
  ariaLabelHide,
  ...rest
}) {
  const [show, setShow] = useState(false);

  return (
    <TextInput
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      helpText={helpText}
      rightAdornment={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="auth-password-toggle text-slate-500"
          aria-label={show ? ariaLabelHide || "Hide password" : ariaLabelShow || "Show password"}
          disabled={disabled}
        >
          {show ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
        </button>
      }
      {...rest}
    />
  );
}
