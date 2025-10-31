/**
 * Translation Namespaces Configuration
 *
 * Defines and organizes translation namespaces for the application.
 *
 * @module i18n/config/namespaces
 */

/**
 * Available translation namespaces
 */
export const namespaces = [
  'common',      // Common UI elements and actions
  'rbac',        // Role-based access control (roles, permissions, features)
  'forms',       // Form labels and placeholders
  'errors',      // Error messages
  'validation',  // Form validation messages
  'booking',     // Booking-related translations
  'facility',    // Facility-related translations
] as const;

/**
 * Type for available namespaces
 */
export type Namespace = typeof namespaces[number];

/**
 * Default namespace for translations
 */
export const defaultNamespace: Namespace = 'common';

/**
 * Namespace descriptions for documentation
 */
export const namespaceDescriptions: Record<Namespace, string> = {
  common: 'Common UI elements, buttons, labels, and general interface text',
  rbac: 'Role-based access control including role names, permissions, and feature descriptions',
  forms: 'Form field labels, placeholders, and help text',
  errors: 'Error messages for API responses and application errors',
  validation: 'Form validation messages for user input',
  booking: 'Booking-specific terminology and messages',
  facility: 'Facility management terminology and messages',
};

/**
 * Namespace loading priority (higher number = higher priority)
 * These namespaces will be loaded first
 */
export const namespacePriority: Record<Namespace, number> = {
  common: 100,      // Always load first
  errors: 90,       // Error handling is critical
  rbac: 80,         // Role information needed early
  forms: 70,        // Forms are common
  validation: 60,   // Related to forms
  booking: 50,      // Feature-specific
  facility: 40,     // Feature-specific
};

/**
 * Get namespaces that should be preloaded
 */
export const getPreloadNamespaces = (): Namespace[] => {
  return namespaces
    .filter(ns => namespacePriority[ns] >= 70)
    .sort((a, b) => namespacePriority[b] - namespacePriority[a]);
};

/**
 * Get namespaces for a specific feature/route
 */
export const getFeatureNamespaces = (feature: string): Namespace[] => {
  const featureNamespaceMap: Record<string, Namespace[]> = {
    auth: ['common', 'forms', 'validation', 'errors'],
    dashboard: ['common', 'rbac', 'errors'],
    booking: ['common', 'booking', 'forms', 'validation', 'errors'],
    facility: ['common', 'facility', 'forms', 'validation', 'errors'],
    admin: ['common', 'rbac', 'forms', 'validation', 'errors'],
    profile: ['common', 'forms', 'validation', 'errors'],
  };

  return featureNamespaceMap[feature] || ['common', 'errors'];
};

/**
 * Check if a namespace exists
 */
export const isValidNamespace = (namespace: string): namespace is Namespace => {
  return namespaces.includes(namespace as Namespace);
};