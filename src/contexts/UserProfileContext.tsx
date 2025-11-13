"use client";

import React, { createContext, useState } from "react";
import { useAuth } from "./hooks/useAuth";

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
  readonly updateProfile: (updates: Partial<IUserProfile>) => void;
  readonly isLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserProfileContext = createContext<IUserProfileContext | undefined>(undefined);

export const UserProfileProvider = ({ children }: { readonly children: React.ReactNode }): JSX.Element => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Build profile from real auth data
  const profile: IUserProfile = {
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
  };

  const updateProfile = (_updates: Partial<IUserProfile>): void => {
    // TODO: Implement profile update via Supabase
    setIsLoading(true);

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
