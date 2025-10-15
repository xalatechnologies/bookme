"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TRole = "system-admin" | "org-admin" | "facility-manager" | "case-worker" | "approver" | "analyst" | "user";

interface IUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: readonly TRole[];
}

interface IAdminAuthContext {
  readonly user: IUser | null;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly logout: () => void;
  readonly updateUser: (updates: Partial<IUser>) => void;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const AdminAuthContext = createContext<IAdminAuthContext | undefined>(undefined);

interface IAdminAuthProviderProps {
  readonly children: ReactNode;
}

export const AdminAuthProvider = ({ children }: IAdminAuthProviderProps): JSX.Element => {
  // Load user data from localStorage or use default
  const getInitialUser = (): IUser | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
    }
    
    // Default user if no saved data
    return {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      roles: ["system-admin", "org-admin", "facility-manager", "case-worker", "approver", "analyst", "user"],
    };
  };

  const [user, setUser] = useState<IUser | null>(getInitialUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let newUser: IUser;
      if (email === "admin@example.com" && password === "password") {
        newUser = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          roles: ["system-admin", "org-admin", "facility-manager", "case-worker", "approver", "analyst", "user"],
        };
      } else if (email === "user@example.com" && password === "password") {
        newUser = {
          id: "2",
          name: "Regular User",
          email: "user@example.com",
          roles: ["user"],
        };
      } else {
        throw new Error("Invalid credentials");
      }
      
      setUser(newUser);
      
      // Save to localStorage
      try {
        localStorage.setItem('adminUser', JSON.stringify(newUser));
      } catch (error) {
      }
    } catch (err) {
      setError((err as Error).message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    
    // Remove from localStorage
    try {
      localStorage.removeItem('adminUser');
    } catch (error) {
    }
  };

  const updateUser = (updates: Partial<IUser>): void => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Save to localStorage
      try {
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      } catch (error) {
      }
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, login, logout, updateUser, isLoading, error }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): IAdminAuthContext => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};