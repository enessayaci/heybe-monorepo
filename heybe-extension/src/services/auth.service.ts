import { apiBridge } from "./content.api.bridge";
import { notifyWebsiteAuth } from "./messenger";
import { getToken, getUser, setToken, setUser } from "./storage.service";

// Hata yönetimini merkezileştiren yardımcı fonksiyon
function handleError(
  error: unknown,
  method: string
): { success: boolean; message: string; status?: number } {
  console.error(`${method} error:`, error);
  return {
    success: false,
    message: error instanceof Error ? error.message : "Network error",
    status:
      error instanceof Error && "status" in error
        ? (error as any).status
        : undefined,
  };
}

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
      const response = await apiBridge.createGuestToken();

      if (!response.success || !response.data) {
        throw Object.assign(
          new Error(response.message || "Failed to create guest token"),
          {
            status: response.status,
          }
        );
      }

      const { token, user: responseUser } = response.data;

      // Storage'a kaydet
      await setToken(token);
      await setUser(responseUser);

      return token;
    } catch (error) {
      throw Object.assign(handleError(error, "Error ensuring guest token"), {
        status:
          error instanceof Error && "status" in error
            ? (error as any).status
            : undefined,
      });
    }
  }

  /**
   * Kullanıcı girişi yapar ve misafir ürünlerini transfer eder
   */
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; status?: number }> {
    try {
      const user = await getUser();
      // Her zaman storage'dan kontrol et
      const storedToken = await getToken();
      const isGuest = user?.is_guest;

      let response;

      // Eğer misafir token varsa transfer ile giriş yap
      if (storedToken && isGuest) {
        response = await apiBridge.loginWithGuestTransfer(email, password);
      } else {
        // Normal giriş
        console.log("login isteği gidiyor...");

        response = await apiBridge.login(email, password);

        console.log(
          "login isteği gitti ve backgrounddan response geldi: ",
          response
        );
      }

      if (!response.success || !response.data) {
        throw Object.assign(new Error(response.message || "Login failed"), {
          status: response.status,
        });
      }

      const { token, user: responseUser } = response.data;

      console.log("login response: ", response);

      // Kullanıcı bilgilerini kaydet
      await setToken(token);
      await setUser(responseUser);

      notifyWebsiteAuth({
        token,
        user: responseUser,
      });

      return { success: true };
    } catch (error) {
      return handleError(error, "Login");
    }
  }

  /**
   * Kullanıcı kaydı yapar ve misafir ürünlerini transfer eder
   */
  async register(
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; status?: number }> {
    try {
      const user = await getUser();
      // Her zaman storage'dan kontrol et
      const storedToken = await getToken();
      const isGuest = user?.is_guest;

      let response;

      // Eğer misafir token varsa transfer ile kayıt ol
      if (storedToken && isGuest) {
        response = await apiBridge.registerWithGuestTransfer(email, password);
      } else {
        // Normal kayıt
        response = await apiBridge.register(email, password);
      }

      if (!response.success || !response.data) {
        throw Object.assign(
          new Error(response.message || "Registration failed"),
          {
            status: response.status,
          }
        );
      }

      const { token, user: responseUser } = response.data;

      // Kullanıcı bilgilerini kaydet
      await setToken(token);
      await setUser(responseUser);

      notifyWebsiteAuth({
        token,
        user,
      });

      return { success: true };
    } catch (error) {
      return handleError(error, "Registration");
    }
  }

  /**
   * Çıkış yapar ve misafir token'a geri döner
   */
  async logout(): Promise<{
    success: boolean;
    message?: string;
    status?: number;
  }> {
    try {
      // Yeni misafir token oluştur
      const response = await apiBridge.createGuestToken();

      if (!response.success || !response.data) {
        throw Object.assign(
          new Error(response.message || "Failed to create guest token"),
          {
            status: response.status,
          }
        );
      }

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
    } catch (error) {
      return handleError(error, "Logout");
    }
  }

  /**
   * Mevcut kullanıcının giriş durumunu kontrol eder
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await getToken();
      const user = await getUser();

      return !!(token && user && !user.is_guest);
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
