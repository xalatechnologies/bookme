"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export interface FormFieldOption {
  readonly value: string;
  readonly label: string;
}

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
  readonly value: string | number | undefined;
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
  readonly options?: readonly FormFieldOption[];
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue =
      type === "number" ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const handleSelectChange = (newValue: string) => {
    onChange(newValue);
  };

  // Render select component
  if (type === "select") {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor={fieldId} className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>

        <Select
          value={value?.toString() || ""}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={fieldId}
            className={error ? "border-red-500" : ""}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

  // Render input or textarea
  const InputComponent = type === "textarea" ? Textarea : Input;
  const inputProps =
    type === "textarea"
      ? { rows }
      : { type, min, max };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={fieldId} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <InputComponent
        id={fieldId}
        name={name}
        value={value ?? ""}
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
