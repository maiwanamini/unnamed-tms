"use client";

import { forwardRef, useId } from "react";

const baseInputClassName =
  "auth-input h-11 mt-0 w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const TextInput = forwardRef(function TextInput(
  {
    id,
    name,
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    autoComplete,
    required,
    disabled,
    variant = "auth", // "auth" | "overlay"
    bare = false,
    inputClassName,
    wrapperClassName,
    labelClassName,
    rightAdornment,
    helpText,
    error,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const baseByVariant = variant === "overlay" ? "overlay-input" : baseInputClassName;

  if (bare) {
    if (rightAdornment) {
      return (
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            className={cn(baseByVariant, "pr-10", inputClassName)}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...rest}
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2">{rightAdornment}</div>
        </div>
      );
    }

    return (
      <input
        ref={ref}
        id={inputId}
        name={name}
        className={cn(baseByVariant, inputClassName)}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className={cn("block text-sm font-medium text-slate-700", labelClassName)}>
          {label}
        </label>
      ) : null}

      <div className={cn(rightAdornment ? "relative" : undefined)}>
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={cn(baseByVariant, rightAdornment ? "pr-10" : undefined, inputClassName)}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {rightAdornment ? <div className="absolute top-1/2 right-2 -translate-y-1/2">{rightAdornment}</div> : null}
      </div>

      {helpText ? (
        <div id={helpId} className="text-xs text-slate-500 mt-1">
          {helpText}
        </div>
      ) : null}

      {error ? (
        <div id={errorId} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
});

export default TextInput;
