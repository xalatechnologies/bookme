# 2. HTTP Client Consolidation

Date: 2025-11-10

## Status

Accepted

## Context

The application had duplicate HTTP client implementations:
1. `src/services/http.ts` - Simple implementation
2. `src/services/shared/httpClient.ts` - Comprehensive implementation

This duplication caused confusion and maintenance overhead.

## Decision

We will consolidate HTTP client usage by:

1. Removing the simple HTTP client implementation (`src/services/http.ts`)
2. Using the comprehensive HTTP client (`src/services/shared/httpClient.ts`) throughout the application
3. Ensuring all HTTP requests use the centralized client with proper error handling

## Consequences

### Positive
- Eliminates code duplication
- Improves maintainability
- Ensures consistent error handling
- Provides better type safety
- Reduces bundle size by removing redundant code

### Negative
- Need to update any code that was using the simple HTTP client
- Potential breaking changes if the comprehensive client has different APIs

## Implementation

1. Removed `src/services/http.ts`
2. Verified no components were using the removed client
3. Updated documentation to reflect the consolidated approach
4. Ensured all HTTP requests use `src/services/shared/httpClient.ts`