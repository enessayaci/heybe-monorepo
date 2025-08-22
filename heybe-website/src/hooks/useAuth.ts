import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { User, LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '../types/api.types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (credentials: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);

  const updateAuthState = useCallback(async () => {
    setUser(authService.getUser());
    const guestStatus = await authService.isGuest();
    setIsGuest(guestStatus);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const token = await authService.getToken();
      if (token) {
        setIsLoading(true);
        const isValid = await authService.validateToken();
        if (isValid) {
          await updateAuthState();
        }
        setIsLoading(false);
      } else {
        await updateAuthState();
      }
    };

    validateToken();
  }, [updateAuthState]);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        await updateAuthState();
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const register = useCallback(async (credentials: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(credentials);
      
      if (response.success) {
        await updateAuthState();
        return true;
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      await updateAuthState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    isGuest,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};