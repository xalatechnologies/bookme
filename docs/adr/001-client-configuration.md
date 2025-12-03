# 1. Centralized Client Configuration

Date: 2025-11-10

## Status

Accepted

## Context

The application was using hardcoded API tokens and had inconsistent client configurations across different components. This led to security risks and maintenance challenges.

## Decision

We will implement a centralized client configuration approach:

1. All third-party service tokens (Mapbox, Supabase) will be configured in dedicated files under `src/lib/clients/`
2. Components and services will import configurations from these centralized files
3. Environment variables will be used for all sensitive configuration values
4. Default fallback values will be empty strings rather than hardcoded tokens

## Consequences

### Positive
- Improved security by removing hardcoded tokens
- Better maintainability through centralized configuration
- Consistent token usage across the application
- Easier environment-specific configuration
- Reduced risk of accidental token exposure

### Negative
- Initial refactoring effort required
- Need to update all components using hardcoded tokens

## Implementation

1. Created `src/lib/clients/mapbox.ts` for Mapbox configuration
2. Created `src/lib/clients/supabase.ts` for Supabase configuration
3. Updated all components to use centralized configurations
4. Removed hardcoded tokens from components
5. Updated environment variable usage to follow Vite conventions (`VITE_*` prefix)