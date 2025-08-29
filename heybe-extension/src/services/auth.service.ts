import { apiService } from "./api.service";
import { notifyWebsiteAuth } from "./messenger";
import { getToken, getUser, setToken, setUser } from "./storage.service";

class AuthService {
  /**
   * Misafir token'ı garanti eder - yoksa oluşturur
   */
  async ensureGuestToken(): Promise<string> {
    try {
      const user = await getUser();
      // Her zaman storage'dan kontrol et
      const storedToken = await getToken();
      const isGuest = user?.is_guest;

      if (storedToken && isGuest) {
        return storedToken;
      }

      // Yeni misafir token oluştur
      const response = await apiService.createGuestToken();

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Storage'a kaydet
        await setToken(token);
        await setUser(user);

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
      const user = await getUser();
      // Her zaman storage'dan kontrol et
      const storedToken = await getToken();
      const isGuest = user?.is_guest;

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
        await setToken(token);
        await setUser({
          email,
          is_guest: user.is_guest,
        });

        notifyWebsiteAuth({
          token,
          user,
        });

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
      const user = await getUser();
      // Her zaman storage'dan kontrol et
      const storedToken = await getToken();
      const isGuest = user?.is_guest;

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
        await setToken(token);
        await setUser(user);

        notifyWebsiteAuth({
          token,
          user,
        });

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
        const { token, user } = response.data;

        // Misafir token'ı kaydet
        await setToken(token);
        await setUser(user);

        // Website'e yeni token'ı bildir
        notifyWebsiteAuth({
          token,
          user,
        });

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
      const token = await getToken();
      const user = await getUser();

      return !!(token && user);
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
