import { storage } from "wxt/storage";

class StorageService {
  // Token işlemleri (project.md'ye göre 'token' key'i)
  async setToken(token: string): Promise<void> {
    await storage.setItem("local:token", token);
  }

  async getToken(): Promise<string | null> {
    return await storage.getItem("local:token");
  }

  async removeToken(): Promise<void> {
    await storage.removeItem("local:token");
  }

  // Guest durumu işlemleri (project.md'ye göre 'is_guest' key'i)
  async setIsGuest(isGuest: boolean): Promise<void> {
    await storage.setItem("local:is_guest", isGuest);
  }

  async getIsGuest(): Promise<boolean> {
    const result = await storage.getItem("local:is_guest");
    return result === true;
  }

  // Kullanıcı bilgileri işlemleri
  async setUser(user: any): Promise<void> {
    await storage.setItem("local:user", user);
  }

  async getUser(): Promise<any | null> {
    return await storage.getItem("local:user");
  }

  // Tüm verileri temizle
  async clearAll(): Promise<void> {
    await storage.removeItem("local:token");
    await storage.removeItem("local:is_guest");
    await storage.removeItem("local:user");
  }
}

export const storageService = new StorageService();
