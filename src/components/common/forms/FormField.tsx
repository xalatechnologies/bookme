"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export interface FormFieldProps {
  readonly id?: string;
  readonly name: string;
  readonly label: string;
  readonly type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "textarea"
    | "date"
    | "time"
    | "select";
  readonly value: string | number;
  readonly onChange: (value: string | number) => void;
  readonly error?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly rows?: number;
  readonly className?: string;
  readonly onBlur?: () => void;
  readonly autoComplete?: string;
  readonly min?: number;
  readonly max?: number;
  readonly options?: readonly { readonly label: string; readonly value: string | number }[];
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  helperText,
  rows = 4,
  className = "",
  onBlur,
  autoComplete,
  min,
  max,
  options,
}) => {
  const fieldId = id || name;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const newValue =
      type === "number" ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  // Render select element
  if (type === "select") {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor={fieldId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>

        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-red-500" : ""
          }`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Render textarea or input
  const InputComponent = type === "textarea" ? Textarea : Input;
  const inputProps = type === "textarea"
    ? { rows }
    : {
        type,
        ...(type === "number" && min !== undefined ? { min } : {}),
        ...(type === "number" && max !== undefined ? { max } : {})
      };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={fieldId} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <InputComponent
        id={fieldId}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={error ? "border-red-500" : ""}
        {...inputProps}
      />

      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};
