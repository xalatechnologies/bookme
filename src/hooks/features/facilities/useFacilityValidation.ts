import { useState, useCallback, useMemo } from "react";
import type { Database } from "@/types/database";

type Facility = Database['public']['Tables']['facilities']['Row'];

/**
 * Validation rule types
 */
export type ValidationRuleType =
  | "required"
  | "email"
  | "minLength"
  | "maxLength"
  | "min"
  | "max"
  | "pattern"
  | "custom";

/**
 * Validation rule definition
 */
export interface ValidationRule {
  readonly type: ValidationRuleType;
  readonly value?: number | string | RegExp;
  readonly message?: string;
  readonly validator?: (value: unknown) => boolean;
}

/**
 * Validation errors map
 */
export interface ValidationErrors {
  readonly [key: string]: string | undefined;
}

/**
 * Facility validation hook return type
 */
export interface UseFacilityValidationReturn {
  readonly errors: ValidationErrors;
  readonly isValid: boolean;
  readonly validateField: (name: string, value: unknown) => boolean;
  readonly validateAll: (data: Partial<Facility>) => boolean;
  readonly clearError: (name: string) => void;
  readonly clearAllErrors: () => void;
  readonly setCustomError: (name: string, message: string) => void;
}

/**
 * Validation rules configuration
 */
export interface ValidationRulesConfig {
  readonly [key: string]: ValidationRule[];
}

/**
 * Default validation rules for facility form
 */
const DEFAULT_VALIDATION_RULES: ValidationRulesConfig = {
  name: [
    { type: "required", message: "Name is required" },
    { type: "minLength", value: 3, message: "Name must be at least 3 characters" },
    { type: "maxLength", value: 100, message: "Name must not exceed 100 characters" },
  ],
  address: [
    { type: "required", message: "Address is required" },
    { type: "minLength", value: 5, message: "Address must be at least 5 characters" },
  ],
  price: [
    { type: "min", value: 0, message: "Price must be 0 or greater" },
  ],
};

/**
 * Custom hook for facility form validation
 *
 * Features:
 * - Field-level validation with multiple rules
 * - Form-level validation
 * - Custom validation rules support
 * - Error message management
 * - Built-in validation rules (required, minLength, maxLength, min, max, pattern, email)
 * - Custom validator functions
 *
 * @param customRules - Custom validation rules (merges with defaults)
 * @returns Validation functions and state
 *
 * @example
 * ```tsx
 * const { errors, validateField, validateAll, clearError, isValid } = useFacilityValidation({
 *   name: [{ type: "required" }],
 *   email: [{ type: "email" }],
 *   capacity: [{ type: "min", value: 1 }],
 * });
 * ```
 */
export const useFacilityValidation = (
  customRules: ValidationRulesConfig = {}
): UseFacilityValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Merge default rules with custom rules
  const validationRules = useMemo(
    () => ({
      ...DEFAULT_VALIDATION_RULES,
      ...customRules,
    }),
    [customRules]
  );

  /**
   * Validate a single value against a rule
   */
  const validateRule = useCallback(
    (value: unknown, rule: ValidationRule): string | null => {
      // Handle required validation
      if (rule.type === "required") {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return rule.message || "This field is required";
        }
        return null;
      }

      // Skip other validations if value is empty (not required)
      if (value === null || value === undefined || value === "") {
        return null;
      }

      // Handle minLength validation
      if (rule.type === "minLength") {
        const length = String(value).length;
        const minLength = Number(rule.value);
        if (length < minLength) {
          return (
            rule.message ||
            `Must be at least ${minLength} character${minLength !== 1 ? "s" : ""}`
          );
        }
        return null;
      }

      // Handle maxLength validation
      if (rule.type === "maxLength") {
        const length = String(value).length;
        const maxLength = Number(rule.value);
        if (length > maxLength) {
          return (
            rule.message ||
            `Must not exceed ${maxLength} character${maxLength !== 1 ? "s" : ""}`
          );
        }
        return null;
      }

      // Handle min value validation
      if (rule.type === "min") {
        const numValue = Number(value);
        const minValue = Number(rule.value);
        if (isNaN(numValue) || numValue < minValue) {
          return rule.message || `Must be at least ${minValue}`;
        }
        return null;
      }

      // Handle max value validation
      if (rule.type === "max") {
        const numValue = Number(value);
        const maxValue = Number(rule.value);
        if (isNaN(numValue) || numValue > maxValue) {
          return rule.message || `Must not exceed ${maxValue}`;
        }
        return null;
      }

      // Handle pattern validation
      if (rule.type === "pattern") {
        const pattern = rule.value as RegExp;
        if (!pattern.test(String(value))) {
          return rule.message || "Invalid format";
        }
        return null;
      }

      // Handle email validation
      if (rule.type === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(String(value))) {
          return rule.message || "Invalid email address";
        }
        return null;
      }

      // Handle custom validation
      if (rule.type === "custom" && rule.validator) {
        const isValid = rule.validator(value);
        if (!isValid) {
          return rule.message || "Validation failed";
        }
        return null;
      }

      return null;
    },
    []
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: string, value: unknown): boolean => {
      const rules = validationRules[name];
      if (!rules || rules.length === 0) {
        return true;
      }

      // Run all rules for this field
      for (const rule of rules) {
        const error = validateRule(value, rule);
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
          return false;
        }
      }

      // Clear error if validation passed
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });

      return true;
    },
    [validationRules, validateRule]
  );

  /**
   * Validate all fields in form data
   */
  const validateAll = useCallback(
    (data: Partial<Facility>): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      // Validate each field that has rules
      Object.keys(validationRules).forEach((fieldName) => {
        const rules = validationRules[fieldName];
        const value = data[fieldName as keyof Facility];

        // Run all rules for this field
        for (const rule of rules) {
          const error = validateRule(value, rule);
          if (error) {
            newErrors[fieldName] = error;
            isValid = false;
            break; // Stop at first error for this field
          }
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [validationRules, validateRule]
  );

  /**
   * Clear a specific field error
   */
  const clearError = useCallback((name: string): void => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  /**
   * Clear all validation errors
   */
  const clearAllErrors = useCallback((): void => {
    setErrors({});
  }, []);

  /**
   * Set a custom error for a field
   */
  const setCustomError = useCallback((name: string, message: string): void => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  /**
   * Check if form is valid (no errors)
   */
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    errors,
    isValid,
    validateField,
    validateAll,
    clearError,
    clearAllErrors,
    setCustomError,
  };
};
