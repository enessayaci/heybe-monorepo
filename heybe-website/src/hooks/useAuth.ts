import { useState, useCallback } from "react";
import {
  login as loginApi,
  loginWithTransfer as loginWithTransferApi,
  register as registerApi,
  registerWithTransfer as registerWithTransferApi,
} from "@/services/authService";
import type { LoginRequest, RegisterRequest } from "../types/api.types";
import {
  clearExtensionStorage,
  getFromExtension,
  saveToExtension,
} from "@/services/extensionService";
import { useMainStoreBase } from "@/store/main";

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (credentials: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = useMainStoreBase((state) => state.setToken);
  const setUser = useMainStoreBase((state) => state.setUser);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const extensionData = await getFromExtension();

      // Her zaman storage'dan kontrol et
      const storedToken = extensionData?.token;
      const storedUser = extensionData?.user;
      const isGuest = storedUser?.is_guest;

      let response;
      // Eğer misafir token varsa transfer ile giriş yap
      if (storedToken && storedUser && isGuest) {
        setToken(storedToken);
        setUser(storedUser);
        response = await loginWithTransferApi(credentials);
      } else {
        // Normal giriş
        response = await loginApi(credentials);
      }

      if (response.success) {
        // Token'ı hem localStorage'a hem extension'a kaydet
        setToken(response.data!.token);
        setUser(response.data!.user);
        await saveToExtension(response.data!);
        return true;
      } else {
        setError(response.message || "Login failed"); // Backend mesajı öncelikli
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const extensionData = await getFromExtension();

      // Her zaman storage'dan kontrol et
      const storedToken = extensionData?.token;
      const storedUser = extensionData?.user;
      const isGuest = storedUser?.is_guest;

      let response;
      // Eğer misafir token varsa transfer ile giriş yap
      if (storedToken && storedUser && isGuest) {
        setToken(storedToken);
        setUser(storedUser);
        response = await registerWithTransferApi(credentials);
      } else {
        // Normal giriş
        response = await registerApi(credentials);
      }

      if (response.success) {
        // Token'ı hem localStorage'a hem extension'a kaydet
        setToken(response.data!.token);
        setUser(response.data!.user);
        await saveToExtension(response.data!);
        return true;
      } else {
        setError(response.message || "Registration failed");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(null);
      setToken(null);
      console.log("📱 [Storage] LocalStorage cleared");
      await clearExtensionStorage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};
