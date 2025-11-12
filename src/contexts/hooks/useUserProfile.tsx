import { useContext } from "react";
import { UserProfileContext } from "../UserProfileContext";
import type { IUserProfileContext } from "../UserProfileContext";

/**
 * Hook to access user profile context
 * Must be used within a UserProfileProvider
 *
 * @returns User profile context
 * @throws Error if used outside UserProfileProvider
 */
export const useUserProfile = (): IUserProfileContext => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
