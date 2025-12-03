import { useContext } from "react";
import { CartContext } from "../CartContext";
import type { ICartContext } from "@/types/cart";

/**
 * Hook to access cart context
 * Must be used within a CartProvider
 *
 * @returns Cart context with all cart operations
 * @throws Error if used outside CartProvider
 */
export const useCart = (): ICartContext => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
