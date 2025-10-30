/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL environment variable');
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');

/**
 * Supabase client instance - the single source of truth for all Supabase interactions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);