"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

const initialProfile: IUserProfile = {
  firstName: "Amin",
  lastName: "Ismail",
  email: "amin@example.com",
  phone: "+47 123 45 678",
  address: "Drammen, Norge",
  dateOfBirth: "1990-01-01",
  avatar: "/placeholder.svg",
  role: "Bruker",
  accountCreated: "2024-02-12",
  lastActive: "2024-01-20T14:30:00Z",
  accountId: "USR-1045",
  subscriptionType: "Gratisbruker"
};

export const UserProfileProvider = ({ children }: { readonly children: React.ReactNode }): JSX.Element => {
  const [profile, setProfile] = useState<IUserProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState<boolean>(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("user-profile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } else {
      }
      setIsLoadedFromStorage(true);
    } catch (error) {
      console.error("Error loading profile from localStorage:", error);
      setIsLoadedFromStorage(true);
    }
  }, []);

  // Save profile to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoadedFromStorage) {
      try {
        localStorage.setItem("user-profile", JSON.stringify(profile));
      } catch (error) {
        console.error("Error saving profile to localStorage:", error);
      }
    } else {
    }
  }, [profile, isLoadedFromStorage]);

  const updateProfile = (updates: Partial<IUserProfile>): void => {
    setIsLoading(true);
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      return newProfile;
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const value: IUserProfileContext = {
    profile,
    updateProfile,
    isLoading
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
