"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

/**
 * Form field props interface
 */
export interface IFormFieldProps {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'number' | 'tel' | 'password' | 'textarea' | 'select';
  readonly value: string | number;
  readonly onChange: (value: string | number) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly helperText?: string;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
  readonly rows?: number;
  readonly min?: number;
  readonly max?: number;
  readonly className?: string;
}

/**
 * Reusable form field component
 *
 * Provides consistent styling and behavior for form inputs
 * Follows Single Responsibility Principle - only handles form field rendering
 *
 * Features:
 * - Multiple input types support
 * - i18n ready
 * - Accessibility compliant
 * - Error handling
 * - Helper text support
 *
 * @param props - Form field props
 */
export const FormField: React.FC<IFormFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  options,
  rows = 3,
  min,
  max,
  className = '',
}): JSX.Element => {
  const { t } = useTranslation('common');

  /**
   * Handle input change
   */
  const handleChange = (newValue: string | number): void => {
    onChange(newValue);
  };

  /**
   * Render input based on type
   */
  const renderInput = (): JSX.Element => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            name={name}
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            aria-invalid={!!error}
            className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          />
        );

      case 'select':
        if (!options) {
          console.error('Select field requires options prop');
          return <div className="text-red-500">Select requires options</div>;
        }
        return (
          <Select
            value={String(value)}
            onValueChange={(newValue) => handleChange(newValue)}
            disabled={disabled}
          >
            <SelectTrigger
              className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
              aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
              aria-invalid={!!error}
            >
              <SelectValue placeholder={placeholder || t('select')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={(e) => {
              const newValue = type === 'number' ? (e.target.value ? parseFloat(e.target.value) : 0) : e.target.value;
              handleChange(newValue);
            }}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            aria-invalid={!!error}
            className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {renderInput()}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
