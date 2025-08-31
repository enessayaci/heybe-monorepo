import { create } from "zustand";

interface LoadingState {
  loadingCounter: number;
  showLoading: () => void;
  hideLoading: () => void;
  isLoading: boolean;
}

export const useLoadingGlobalStore = create<LoadingState>((set, get) => ({
  loadingCounter: 0,
  showLoading: () =>
    set((state) => ({
      loadingCounter: state.loadingCounter + 1,
      isLoading: true, // Eğer yükleme başladıysa, kesinlikle true olmalı
    })),
  hideLoading: () =>
    set((state) => {
      const newCounter = Math.max(0, state.loadingCounter - 1);
      return {
        loadingCounter: newCounter,
        isLoading: newCounter > 0, // Eğer counter 0 olursa isLoading false olur
      };
    }),
  isLoading: false,
}));
