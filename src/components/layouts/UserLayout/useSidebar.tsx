import { createContext, useContext } from "react";

export interface ISidebarContext {
  readonly isCollapsed: boolean;
  readonly toggleCollapse: () => void;
  readonly isMobileMenuOpen: boolean;
  readonly toggleMobileMenu: () => void;
}

export const SidebarContext = createContext<ISidebarContext | undefined>(undefined);

export const useSidebar = (): ISidebarContext => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
