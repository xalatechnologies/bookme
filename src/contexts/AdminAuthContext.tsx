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
  readonly isLoading: boolean;
  readonly error: string | null;
}

const AdminAuthContext = createContext<IAdminAuthContext | undefined>(undefined);

interface IAdminAuthProviderProps {
  readonly children: ReactNode;
}

export const AdminAuthProvider = ({ children }: IAdminAuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<IUser | null>({
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    roles: ["system-admin", "org-admin", "facility-manager", "case-worker", "approver", "analyst", "user"],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (email === "admin@example.com" && password === "password") {
        setUser({
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          roles: ["system-admin", "org-admin", "facility-manager", "case-worker", "approver", "analyst", "user"],
        });
      } else if (email === "user@example.com" && password === "password") {
        setUser({
          id: "2",
          name: "Regular User",
          email: "user@example.com",
          roles: ["user"],
        });
      } else {
        throw new Error("Invalid credentials");
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
  };

  return (
    <AdminAuthContext.Provider value={{ user, login, logout, isLoading, error }}>
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