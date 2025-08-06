// Cross-Browser Storage Helper - Website için
// Chrome, Firefox, Safari, Edge tüm tarayıcılarda çalışır

class CrossBrowserStorageHelper {
  constructor() {
    this.storageKey = "tum_listem_user_id";
    this.guestUUIDKey = "tum_listem_guest_uuid";
    this.permanentUUIDKey = "tum_listem_permanent_uuid";
    this.loginStatusKey = "tum_listem_login_status";
    this.browserType = this.detectBrowser();
  }

  // Tarayıcı türünü tespit et
  detectBrowser() {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      if (chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        if (manifest.browser_specific_settings) {
          return "firefox";
        }
      }
      return "chrome"; // Chrome, Edge, Brave, Opera
    }
    return "web"; // Safari, diğer tarayıcılar
  }

  // Cross-browser storage API'si
  getStorageAPI() {
    switch (this.browserType) {
      case "firefox":
        return {
          set: (data) => browser.storage.local.set(data),
          get: (keys) => browser.storage.local.get(keys),
          remove: (keys) => browser.storage.local.remove(keys),
          clear: () => browser.storage.local.clear(),
        };
      case "chrome":
        return {
          set: (data) => chrome.storage.local.set(data),
          get: (keys) => chrome.storage.local.get(keys),
          remove: (keys) => chrome.storage.local.remove(keys),
          clear: () => chrome.storage.local.clear(),
        };
      case "web":
      default:
        return {
          set: (data) => {
            Object.keys(data).forEach((key) => {
              localStorage.setItem(key, JSON.stringify(data[key]));
            });
            return Promise.resolve();
          },
          get: (keys) => {
            const result = {};
            keys.forEach((key) => {
              const value = localStorage.getItem(key);
              result[key] = value ? JSON.parse(value) : null;
            });
            return Promise.resolve(result);
          },
          remove: (keys) => {
            keys.forEach((key) => localStorage.removeItem(key));
            return Promise.resolve();
          },
          clear: () => {
            // Sadece bizim key'leri temizle
            const keysToRemove = [
              this.guestUUIDKey,
              this.permanentUUIDKey,
              this.loginStatusKey,
            ];
            keysToRemove.forEach((key) => localStorage.removeItem(key));
            return Promise.resolve();
          },
        };
    }
  }

  // UUID'yi kaydet
  async setUserId(userId, type = "guest") {
    try {
      const storage = this.getStorageAPI();

      if (type === "permanent") {
        await storage.set({
          [this.permanentUUIDKey]: userId,
          [this.loginStatusKey]: true,
        });
        console.log("✅ [Storage] Permanent UUID kaydedildi:", userId);
      } else {
        await storage.set({
          [this.guestUUIDKey]: userId,
        });
        console.log("✅ [Storage] Guest UUID kaydedildi:", userId);
      }

      return true;
    } catch (error) {
      console.error("❌ [Storage] UUID yazma hatası:", error);
      return false;
    }
  }

  // UUID'yi oku
  async getUserId() {
    try {
      const storage = this.getStorageAPI();
      const result = await storage.get([
        this.guestUUIDKey,
        this.permanentUUIDKey,
        this.loginStatusKey,
      ]);

      // Önce permanent UUID'yi kontrol et
      if (result[this.permanentUUIDKey]) {
        console.log(
          "✅ [Storage] Permanent UUID okundu:",
          result[this.permanentUUIDKey]
        );
        return {
          uuid: result[this.permanentUUIDKey],
          type: "permanent",
          isLoggedIn: result[this.loginStatusKey] || false,
        };
      }

      // Permanent yoksa guest UUID'yi kontrol et
      if (result[this.guestUUIDKey]) {
        console.log(
          "✅ [Storage] Guest UUID okundu:",
          result[this.guestUUIDKey]
        );
        return {
          uuid: result[this.guestUUIDKey],
          type: "guest",
          isLoggedIn: false,
        };
      }

      console.log("❌ [Storage] UUID bulunamadı");
      return null;
    } catch (error) {
      console.error("❌ [Storage] UUID okuma hatası:", error);
      return null;
    }
  }

  // Guest UUID oluştur
  async createGuestUUID() {
    const guestUUID = this.generateUUID();
    const success = await this.setUserId(guestUUID, "guest");

    if (success) {
      console.log("✅ [Storage] Yeni Guest UUID oluşturuldu:", guestUUID);
      return guestUUID;
    }

    return null;
  }

  // UUID oluştur
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Çıkış yap
  async logout() {
    try {
      const storage = this.getStorageAPI();
      await storage.remove([
        this.guestUUIDKey,
        this.permanentUUIDKey,
        this.loginStatusKey,
      ]);

      console.log("✅ [Storage] Çıkış yapıldı, tüm UUID'ler temizlendi");
      return true;
    } catch (error) {
      console.error("❌ [Storage] Çıkış hatası:", error);
      return false;
    }
  }

  // Aktif UUID'yi al veya oluştur
  async getOrCreateActiveUUID() {
    const existingUUID = await this.getUserId();

    if (existingUUID) {
      return existingUUID;
    }

    // UUID yoksa yeni guest UUID oluştur
    const newGuestUUID = await this.createGuestUUID();
    if (newGuestUUID) {
      return {
        uuid: newGuestUUID,
        type: "guest",
        isLoggedIn: false,
      };
    }

    return null;
  }
}

export default CrossBrowserStorageHelper;
