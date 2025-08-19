import { apiService } from "./api.service";
import { storageService } from "./storage.service";
import type { AuthResponse, GuestTokenResponse } from "./api.types";

class AuthService {
  private guestTokenCache: string | null = null;

  /**
   * Misafir token'ı garanti eder - yoksa oluşturur
   */
  async ensureGuestToken(): Promise<string> {
    try {
      // Önce cache'den kontrol et
      if (this.guestTokenCache) {
        return this.guestTokenCache;
      }

      // Storage'dan kontrol et
      const storedToken = await storageService.getToken();
      const isGuest = await storageService.getIsGuest();

      if (storedToken && isGuest) {
        this.guestTokenCache = storedToken;
        return storedToken;
      }

      // Yeni misafir token oluştur
      const response = await apiService.createGuestToken();

      if (response.success && response.data) {
        const { token } = response.data;

        // Storage'a kaydet
        await storageService.setToken(token);
        await storageService.setIsGuest(true);

        // Cache'e kaydet
        this.guestTokenCache = token;

        return token;
      }

      throw new Error("Failed to create guest token");
    } catch (error) {
      console.error("Error ensuring guest token:", error);
      throw error;
    }
  }

  /**
   * Kullanıcı girişi yapar ve misafir ürünlerini transfer eder
   */
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Mevcut storage'ı kontrol et
      const storedToken = await storageService.getToken();
      const isGuest = await storageService.getIsGuest();

      let response;

      // Eğer misafir token varsa transfer ile giriş yap
      if (storedToken && isGuest) {
        response = await apiService.loginWithGuestTransfer(email, password);
      } else {
        // Normal giriş
        response = await apiService.login(email, password);
      }

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Kullanıcı bilgilerini kaydet
        await storageService.setToken(token);
        await storageService.setIsGuest(false);

        // Cache'i temizle
        this.guestTokenCache = null;

        return { success: true };
      }

      return { success: false, message: response.message || "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error" };
    }
  }

  /**
   * Kullanıcı kaydı yapar ve misafir ürünlerini transfer eder
   */
  async register(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Mevcut storage'ı kontrol et
      const storedToken = await storageService.getToken();
      const isGuest = await storageService.getIsGuest();

      let response;

      // Eğer misafir token varsa transfer ile kayıt ol
      if (storedToken && isGuest) {
        response = await apiService.registerWithGuestTransfer(email, password);
      } else {
        // Normal kayıt
        response = await apiService.register(email, password);
      }

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Kullanıcı bilgilerini kaydet
        await storageService.setToken(token);
        await storageService.setIsGuest(false);

        // Cache'i temizle
        this.guestTokenCache = null;

        return { success: true };
      }

      return {
        success: false,
        message: response.message || "Registration failed",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error" };
    }
  }

  /**
   * Çıkış yapar ve misafir token'a geri döner
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      // Yeni misafir token oluştur
      const response = await apiService.createGuestToken();

      if (response.success && response.data) {
        const { token } = response.data;

        // Misafir token'ı kaydet
        await storageService.setToken(token);
        await storageService.setIsGuest(true);

        // Cache'i güncelle
        this.guestTokenCache = token;

        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false };
    }
  }

  /**
   * Mevcut kullanıcının giriş durumunu kontrol eder
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await storageService.getToken();
      const isGuest = await storageService.getIsGuest();

      return !!(token && !isGuest);
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  /**
   * Mevcut token'ı döndürür (misafir veya kullanıcı)
   */
  async getCurrentToken(): Promise<string | null> {
    try {
      return await storageService.getToken();
    } catch (error) {
      console.error("Error getting current token:", error);
      return null;
    }
  }

  /**
   * Geçerli bir token olup olmadığını kontrol eder
   */
  async hasValidToken(): Promise<boolean> {
    try {
      const token = await storageService.getToken();
      return !!token;
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
