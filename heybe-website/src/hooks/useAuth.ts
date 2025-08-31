import { useState, useCallback } from "react";
import {
  login as loginApi,
  register as registerApi,
} from "@/services/authService";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/api.types";
import {
  clearExtensionStorage,
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
      const response = await loginApi(credentials);

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
      const response = await registerApi(credentials);

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
