"use client";

import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { usersService } from "@/services/supabase/users.service";
import { avatarService } from "@/services/supabase/avatar.service";

export interface IUserProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly dateOfBirth: string;
  readonly avatar: string;
  readonly role: string;
  readonly accountCreated: string;
  readonly lastActive: string;
  readonly accountId: string;
  readonly subscriptionType: string;
}

export interface IUserProfileContext {
  readonly profile: IUserProfile;
  readonly updateProfile: (updates: Partial<IUserProfile>) => Promise<void>;
  readonly isLoading: boolean;
  readonly refreshProfile: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserProfileContext = createContext<IUserProfileContext | undefined>(undefined);

export const UserProfileProvider = ({ children }: { readonly children: React.ReactNode }): JSX.Element => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [profile, setProfile] = useState<IUserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    avatar: "",
    role: "Bruker",
    accountCreated: "",
    lastActive: new Date().toISOString(),
    accountId: "",
    subscriptionType: "Gratisbruker"
  });

  // Load profile data from Supabase
  const loadProfile = async (): Promise<void> => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get user profile from Supabase
      const userProfile = await usersService.getById(user.id);
      
      // Get avatar URL
      const avatarUrl = await avatarService.getAvatarUrl(user.id);
      
      // Build profile object
      let firstName = "";
      let lastName = "";
      
      if (userProfile?.display_name) {
        const nameParts = userProfile.display_name.split(' ');
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(' ') || "";
      } else if (user?.email) {
        firstName = user.email.split('@')[0] || "Bruker";
      }
      
      setProfile({
        firstName,
        lastName,
        email: user.email || userProfile?.email || "user@booknor.no",
        phone: userProfile?.phone || "",
        address: "",
        dateOfBirth: "",
        avatar: avatarUrl || "",
        role: "Bruker",
        accountCreated: user.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        accountId: user.id || "",
        subscriptionType: "Gratisbruker"
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to default profile
      let firstName = "Bruker";
      const lastName = "";
      
      if (user?.email) {
        firstName = user.email.split('@')[0] || "Bruker";
      }
      
      setProfile({
        firstName,
        lastName,
        email: user?.email || "user@booknor.no",
        phone: authProfile?.phone || "",
        address: "",
        dateOfBirth: "",
        avatar: "",
        role: "Bruker",
        accountCreated: user?.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        accountId: user?.id || "",
        subscriptionType: "Gratisbruker"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile when user is available or authProfile changes
  useEffect(() => {
    if (user?.id && !authLoading) {
      loadProfile();
    }
  }, [user?.id, authLoading, refreshCounter, authProfile]);

  const refreshProfile = async (): Promise<void> => {
    setRefreshCounter(prev => prev + 1);
  };

  const updateProfile = async (updates: Partial<IUserProfile>): Promise<void> => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Update user profile in Supabase
      const updateData: any = {};
      
      if (updates.firstName || updates.lastName) {
        const firstName = updates.firstName || profile.firstName;
        const lastName = updates.lastName || profile.lastName;
        updateData.display_name = `${firstName} ${lastName}`.trim();
      }
      
      if (updates.phone !== undefined) {
        updateData.phone = updates.phone;
      }
      
      if (updates.email !== undefined) {
        updateData.email = updates.email;
      }
      
      // Only update if there's data to update
      if (Object.keys(updateData).length > 0) {
        await usersService.update(user.id, updateData);
      }
      
      // Handle avatar update specifically
      if (updates.avatar) {
        try {
          await usersService.updateAvatar(user.id, updates.avatar);
        } catch (avatarError) {
          console.warn('Failed to update avatar in database, continuing with local update:', avatarError);
        }
      }
      
      // Update all fields
      setProfile(prev => ({
        ...prev,
        ...updates
      }));
      
      // Refresh profile to get updated data
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: IUserProfileContext = {
    profile,
    updateProfile,
    isLoading: isLoading || authLoading,
    refreshProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};