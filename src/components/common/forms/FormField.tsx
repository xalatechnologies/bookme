"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'date' | 'time';
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
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  helperText,
  rows = 4,
  className = '',
  onBlur,
  autoComplete,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };
  
  const InputComponent = type === 'textarea' ? Textarea : Input;
  const inputProps = type === 'textarea' ? { rows } : { type };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <InputComponent
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={error ? 'border-red-500' : ''}
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
