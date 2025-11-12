/**
 * Hook to get the current organization ID
 *
 * This hook provides the organization ID based on the current user's context.
 * For now, it returns the Drammen Kommune organization ID.
 *
 * TODO: Implement proper organization selection logic based on:
 * - User's default organization from profile
 * - URL-based organization routing
 * - Organization switcher component
 */

import { useAuth } from "@/contexts/hooks";
import { useMemo } from 'react';

// Default organization ID for Drammen Kommune
const DEFAULT_ORG_ID = 'fdd29683-8e3c-48be-bd2c-12d3c3ef028f';

/**
 * Returns the current organization ID
 *
 * @returns Organization UUID
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const orgId = useOrganizationId();
 *   const { data: facilities } = useFacilities(orgId);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useOrganizationId(): string {
  const { user } = useAuth();

  const orgId = useMemo(() => {
    // TODO: Get organization ID from user profile
    // const profile = user?.user_metadata?.profile;
    // return profile?.default_org_id || DEFAULT_ORG_ID;

    // For now, return the default Drammen Kommune org
    return DEFAULT_ORG_ID;
  }, [user]);

  return orgId;
}

/**
 * Hook to get organization ID with loading state
 *
 * @returns Object with orgId and isLoading
 */
export function useOrganizationIdWithLoading(): {
  orgId: string | null;
  isLoading: boolean;
} {
  const { user, loading } = useAuth();

  const orgId = useMemo(() => {
    if (!user) return null;
    return DEFAULT_ORG_ID;
  }, [user]);

  return {
    orgId,
    isLoading: loading,
  };
}
