/**
 * Library Layer - Main Barrel Export
 *
 * Centralized re-exports for the entire lib layer.
 * This allows imports like: import { supabase, cn } from '@/lib';
 */

// Client configurations
export * from './clients';

// Application configuration
export * from './config';

// Shared UI utilities
export * from './utils';
