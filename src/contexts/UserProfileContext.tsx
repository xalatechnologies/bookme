"use client";

import React, { createContext, useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { usersService } from "@/services/supabase/users.service";

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
}

export const UserProfileContext = createContext<IUserProfileContext | undefined>(undefined);

export const UserProfileProvider = ({ children }: { readonly children: React.ReactNode }): JSX.Element => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<IUserProfile>({
    firstName: authProfile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || "Bruker",
    lastName: authProfile?.display_name?.split(' ').slice(1).join(' ') || "",
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

  // Load profile data from Supabase when user is available
  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const userProfile: any = await usersService.getById(user.id);
          if (userProfile) {
            // Parse display_name to get first and last name
            let firstName = "";
            let lastName = "";
            if (userProfile.display_name) {
              const nameParts = userProfile.display_name.split(' ');
              firstName = nameParts[0] || "";
              lastName = nameParts.slice(1).join(' ') || "";
            }

            // Load avatar from localStorage
            const storageKey = `avatar_${user.id}`;
            const storedAvatar = localStorage.getItem(storageKey) || "";

            // Load additional fields from localStorage
            const addressKey = `address_${user.id}`;
            const dateOfBirthKey = `dateOfBirth_${user.id}`;
            const storedAddress = localStorage.getItem(addressKey) || "";
            const storedDateOfBirth = localStorage.getItem(dateOfBirthKey) || "";

            setProfile(prev => ({
              ...prev,
              firstName: firstName || prev.firstName,
              lastName: lastName || prev.lastName,
              email: userProfile.email || prev.email,
              phone: userProfile.phone || prev.phone,
              address: storedAddress || prev.address,
              dateOfBirth: storedDateOfBirth || prev.dateOfBirth,
              avatar: storedAvatar || prev.avatar,
              // Other fields not in database will remain as defaults
              accountCreated: userProfile.created_at || prev.accountCreated,
              lastActive: userProfile.updated_at || prev.lastActive,
              accountId: userProfile.user_id || prev.accountId,
            }));
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user?.id]);

  const updateProfile = async (updates: Partial<IUserProfile>): Promise<void> => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Handle avatar updates separately using localStorage
      if (updates.avatar !== undefined) {
        const storageKey = `avatar_${user.id}`;
        if (updates.avatar) {
          localStorage.setItem(storageKey, updates.avatar);
        } else {
          localStorage.removeItem(storageKey);
        }
      }

      // Handle address updates using localStorage
      if (updates.address !== undefined) {
        const addressKey = `address_${user.id}`;
        if (updates.address) {
          localStorage.setItem(addressKey, updates.address);
        } else {
          localStorage.removeItem(addressKey);
        }
      }

      // Handle dateOfBirth updates using localStorage
      if (updates.dateOfBirth !== undefined) {
        const dateOfBirthKey = `dateOfBirth_${user.id}`;
        if (updates.dateOfBirth) {
          localStorage.setItem(dateOfBirthKey, updates.dateOfBirth);
        } else {
          localStorage.removeItem(dateOfBirthKey);
        }
      }

      // Update other fields in Supabase
      const updateData: any = {};
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        updateData.display_name = updates.firstName && updates.lastName 
          ? `${updates.firstName} ${updates.lastName}` 
          : (updates.firstName || updates.lastName || undefined);
      }
      if (updates.phone !== undefined) {
        updateData.phone = updates.phone;
      }
      if (updates.email !== undefined) {
        updateData.email = updates.email;
      }

      if (Object.keys(updateData).length > 0) {
        const updatedProfile: any = await usersService.update(user.id, updateData);
        
        // Update local state
        setProfile(prev => ({
          ...prev,
          ...updates,
          lastActive: updatedProfile?.updated_at || prev.lastActive,
        }));
      } else {
        // Just update local state for avatar, address, and dateOfBirth
        setProfile(prev => ({
          ...prev,
          ...updates,
        }));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: IUserProfileContext = {
    profile,
    updateProfile,
    isLoading: isLoading || authLoading
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
