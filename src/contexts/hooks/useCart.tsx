/**
 * Hook to access cart store
 * 
 * This hook provides direct access to the Zustand cart store.
 * No provider wrapper needed - Zustand handles state globally.
 *
 * @returns Cart store with all cart operations
 * 
 * @example
 * ```tsx
 * const { items, addItem, removeItem, clearCart } = useCart();
 * ```
 */
export { useCartStore as useCart } from "@/stores/cartStore";
