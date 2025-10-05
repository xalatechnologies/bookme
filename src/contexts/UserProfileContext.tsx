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
      console.log("Loading profile from localStorage:", savedProfile);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        console.log("Parsed profile:", parsedProfile);
        setProfile(parsedProfile);
      } else {
        console.log("No saved profile found, using initial profile");
      }
      setIsLoadedFromStorage(true);
    } catch (error) {
      console.error("Error loading profile from localStorage:", error);
      console.log("Using initial profile as fallback");
      setIsLoadedFromStorage(true);
    }
  }, []);

  // Save profile to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoadedFromStorage) {
      try {
        console.log("Saving profile to localStorage:", profile);
        localStorage.setItem("user-profile", JSON.stringify(profile));
        console.log("Profile saved successfully to localStorage");
      } catch (error) {
        console.error("Error saving profile to localStorage:", error);
      }
    } else {
      console.log("Skipping save - not loaded from storage yet");
    }
  }, [profile, isLoadedFromStorage]);

  const updateProfile = (updates: Partial<IUserProfile>): void => {
    console.log("updateProfile called with updates:", updates);
    setIsLoading(true);
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      console.log("New profile state:", newProfile);
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
