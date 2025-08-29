import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/api.types";

interface MainStoreState {
  isExtensionAvailable: boolean;
  user: User | null;
  token: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setExtensionAvailable: (isAvailable: boolean) => void;
}

export const useMainStoreBase = create<MainStoreState>()(
  persist(
    (set) => ({
      isExtensionAvailable: false,
      user: null,
      token: null,
      setToken: (newToken: string | null) => set({ token: newToken }),
      setUser: (newUser: User | null) => set({ user: newUser }),
      setExtensionAvailable: (isAvailable: boolean) =>
        set({ isExtensionAvailable: isAvailable }),
    }),
    {
      name: "main-storage", // Unique key for localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }), // Only persist user and token
    }
  )
);
