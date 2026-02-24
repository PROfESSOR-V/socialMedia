import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

interface StoreState {
  // Auth State
  token: string | null;
  user: User | null;
  setLogin: (token: string, user: User) => void;
  setLogout: () => void;
  setUser: (user: User) => void;

  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  toggleCart: () => void;
  clearCart: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Auth INITIAL STATE
      token: null,
      user: null,
      setLogin: (token, user) => set({ token, user }),
      setLogout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),

      // Cart INITIAL STATE
      cart: [],
      isCartOpen: false,
      fetchCart: async () => {
        const state = set as any; // zustand trick to read state inside actions if we don't use get()
        // wait, we can just use `get()` by adding it to the store creator
        // let's just do it directly with api
        try {
           const cartData = await api.cart.get();
           if (cartData && cartData.items) {
               // Assuming backend returns item list with productId, quantity, price.
               // For full functionality, backend should also return name/image or we sync local cart item
               // For now, we will just use it primarily as backend sync.
           }
        } catch (error) {
           console.error("Failed to fetch cart", error);
        }
      },
      addToCart: async (item) => {
        // Optimistic UI
        set((state) => {
          const existingItem = state.cart.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isCartOpen: true,
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }], isCartOpen: true };
        });

        // Sync with backend if logged in
        try {
          await api.cart.add(item.id, 1);
        } catch (error) {
          console.error("Failed to sync cart add", error);
        }
      },
      removeFromCart: async (id) => {
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) }));
        try {
          await api.cart.remove(id);
        } catch (error) {
          console.error("Failed to sync cart remove", error);
        }
      },
      updateQuantity: async (id, quantity) => {
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ),
        }));
        try {
          await api.cart.update(id, quantity);
        } catch (error) {
          console.error("Failed to sync cart update", error);
        }
      },
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      clearCart: async () => {
        set({ cart: [] });
        try {
          await api.cart.clear();
        } catch (error) {
          console.error("Failed to sync cart clear", error);
        }
      },
    }),
    {
      name: 'auth-storage', // unique name
      partialize: (state) => ({ token: state.token, user: state.user, cart: state.cart }), // Save auth and cart
    }
  )
);
