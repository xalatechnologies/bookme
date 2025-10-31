import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Validation rule types
 */
export interface ValidationRule {
  readonly type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'minValue' | 'maxValue' | 'pattern' | 'custom';
  readonly value?: number | string | RegExp;
  readonly message?: string;
  readonly validate?: (value: unknown) => boolean;
}

export interface ValidationRules {
  readonly [key: string]: readonly ValidationRule[];
}

export interface ValidationErrors {
  readonly [key: string]: string;
}

/**
 * Form validation hook
 *
 * Provides reusable validation logic with i18n support
 * Following Single Responsibility Principle - only handles validation
 *
 * @param rules - Validation rules for form fields
 * @returns Validation state and methods
 */
export const useFormValidation = (rules: ValidationRules) => {
  const { t } = useTranslation('validation');
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback((name: string, value: unknown): string | null => {
    const fieldRules = rules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            return rule.message || t('required');
          }
          break;

        case 'email':
          if (value && typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return rule.message || t('invalid_email');
            }
          }
          break;

        case 'phone':
          if (value && typeof value === 'string') {
            const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
            if (!phoneRegex.test(value)) {
              return rule.message || t('invalid_phone');
            }
          }
          break;

        case 'minLength':
          if (value && typeof value === 'string' && rule.value) {
            if (value.length < Number(rule.value)) {
              return rule.message || t('min_length', { count: rule.value });
            }
          }
          break;

        case 'maxLength':
          if (value && typeof value === 'string' && rule.value) {
            if (value.length > Number(rule.value)) {
              return rule.message || t('max_length', { count: rule.value });
            }
          }
          break;

        case 'minValue':
          if (value !== null && value !== undefined && rule.value) {
            if (Number(value) < Number(rule.value)) {
              return rule.message || t('min_value', { value: rule.value });
            }
          }
          break;

        case 'maxValue':
          if (value !== null && value !== undefined && rule.value) {
            if (Number(value) > Number(rule.value)) {
              return rule.message || t('max_value', { value: rule.value });
            }
          }
          break;

        case 'pattern':
          if (value && typeof value === 'string' && rule.value instanceof RegExp) {
            if (!rule.value.test(value)) {
              return rule.message || t('invalid_format');
            }
          }
          break;

        case 'custom':
          if (rule.validate && !rule.validate(value)) {
            return rule.message || t('validation_failed');
          }
          break;
      }
    }

    return null;
  }, [rules, t]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback((data: Record<string, unknown>): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  /**
   * Clear errors for a specific field
   */
  const clearError = useCallback((name: string): void => {
    setErrors(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback((): void => {
    setErrors({});
  }, []);

  /**
   * Set error for a field manually
   */
  const setError = useCallback((name: string, message: string): void => {
    setErrors(prev => ({ ...prev, [name]: message }));
  }, []);

  return {
    errors,
    validateField,
    validateAll,
    clearError,
    clearAllErrors,
    setError,
  };
};
