"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface IUserProfile {
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

interface IUserProfileContext {
  readonly profile: IUserProfile;
  readonly updateProfile: (updates: Partial<IUserProfile>) => void;
  readonly isLoading: boolean;
}

const UserProfileContext = createContext<IUserProfileContext | undefined>(undefined);

export const UserProfileProvider = ({ children }: { readonly children: React.ReactNode }): JSX.Element => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Build profile from real auth data
  const profile: IUserProfile = {
    firstName: authProfile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || "Bruker",
    lastName: authProfile?.display_name?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "user@bookme.no",
    phone: authProfile?.phone || "",
    address: "",
    dateOfBirth: "",
    avatar: "",
    role: "Bruker",
    accountCreated: user?.created_at || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    accountId: user?.id || "",
    subscriptionType: "Gratisbruker"
  };

  const updateProfile = (updates: Partial<IUserProfile>): void => {
    // TODO: Implement profile update via Supabase
    setIsLoading(true);
    console.log('Profile update requested:', updates);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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

export const useUserProfile = (): IUserProfileContext => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
