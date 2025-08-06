// Cross-Browser Storage Helper - Website için
// Chrome, Firefox, Safari, Edge tüm tarayıcılarda çalışır

class CrossBrowserStorageHelper {
  constructor() {
    // BASİT STORAGE SİSTEMİ - Sadece 2 key
    this.uuidKey = "currentUuid";
    this.roleKey = "role"; // "GUEST" veya "USER"
    this.browserType = this.detectBrowser();

    console.log("🚀 Cross-Browser Storage Helper yüklendi:", {
      type: this.browserType,
      hasExtension: this.browserType !== "web",
      storageAPI: this.getStorageAPI() ? "Available" : "Not Available",
    });
  }

  // Tarayıcı türünü tespit et
  detectBrowser() {
    // Extension varlığını async olarak test etmek yerine
    // sadece chrome/browser API'nin varlığını kontrol et
    if (typeof chrome !== "undefined" && chrome.runtime) {
      console.log("🔍 [Storage] Chrome API mevcut, extension test ediliyor...");
      return "chrome";
    } else if (typeof browser !== "undefined" && browser.runtime) {
      console.log(
        "🔍 [Storage] Firefox API mevcut, extension test ediliyor..."
      );
      return "firefox";
    } else {
      console.log("ℹ️ [Storage] Extension API'si bulunamadı, web browser");
      return "web";
    }
  }

  // Cross-browser storage API'si
  getStorageAPI() {
    switch (this.browserType) {
      case "firefox":
        // Firefox'ta extension varsa browser.storage.local, yoksa localStorage
        if (typeof browser !== "undefined" && browser.storage) {
          return {
            set: (data) => browser.storage.local.set(data),
            get: (keys) => browser.storage.local.get(keys),
            remove: (keys) => browser.storage.local.remove(keys),
            clear: () => browser.storage.local.clear(),
          };
        } else {
          return this.getLocalStorageAPI();
        }
      case "chrome":
        // Chrome'da extension varsa chrome.storage.local, yoksa localStorage
        if (typeof chrome !== "undefined" && chrome.storage) {
          return {
            set: (data) => chrome.storage.local.set(data),
            get: (keys) => chrome.storage.local.get(keys),
            remove: (keys) => chrome.storage.local.remove(keys),
            clear: () => chrome.storage.local.clear(),
          };
        } else {
          return this.getLocalStorageAPI();
        }
      case "web":
      default:
        // Web tarayıcılarında her zaman localStorage kullan
        return this.getLocalStorageAPI();
    }
  }

  // localStorage API'si (extension yoksa)
  getLocalStorageAPI() {
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

  // Aktif UUID'yi al veya oluştur - BASİT MANTIK
  async getOrCreateActiveUUID() {
    console.log("🔍 [Storage] UUID alma başladı");

    // 1. Extension var mı kontrol et
    const isExtensionAvailable = await this.isExtensionAvailable();
    console.log("🔍 [Storage] Extension durumu:", isExtensionAvailable);

    if (isExtensionAvailable) {
      // Extension varsa ondan UUID al
      console.log(
        "✅ [Storage] Extension mevcut, chrome.storage.local okunuyor..."
      );
      try {
        const extensionUUID = await this.getExtensionStorage();
        if (
          extensionUUID &&
          extensionUUID.uuid &&
          extensionUUID.uuid !== "undefined"
        ) {
          console.log(
            "✅ [Storage] Extension'dan geçerli UUID alındı:",
            extensionUUID
          );
          return extensionUUID;
        } else {
          console.log(
            "⚠️ [Storage] Extension'da geçerli UUID yok, yeni oluşturuluyor..."
          );
        }
      } catch (error) {
        console.log("❌ [Storage] Extension storage okuma hatası:", error);
      }
    }

    // 2. Extension yoksa veya UUID yoksa localStorage'dan oku
    console.log("🔍 [Storage] localStorage kontrol ediliyor...");
    const existingUUID = await this.getUserId();
    if (
      existingUUID &&
      existingUUID.uuid &&
      existingUUID.uuid !== "undefined"
    ) {
      console.log(
        "✅ [Storage] localStorage'dan geçerli UUID alındı:",
        existingUUID
      );
      return existingUUID;
    }

    // 3. Hiçbir yerde UUID yoksa yeni guest UUID oluştur
    console.log("🆕 [Storage] Yeni guest UUID oluşturuluyor...");
    const newGuestUUID = await this.createGuestUUID();
    if (newGuestUUID) {
      return {
        uuid: newGuestUUID,
        type: "guest",
        isLoggedIn: false,
      };
    }

    console.log("❌ [Storage] UUID oluşturulamadı");
    return null;
  }

  // Extension mevcut mu kontrol et - ASYNC TEST
  async isExtensionAvailable() {
    if (typeof chrome === "undefined" || !chrome.runtime) {
      console.log("🔍 [Storage] Chrome API yok");
      return false;
    }

    try {
      // Extension'a test mesajı gönder
      return await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "test" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log(
              "🔍 [Storage] Extension bulunamadı:",
              chrome.runtime.lastError.message
            );
            resolve(false);
          } else {
            console.log("🔍 [Storage] Extension mevcut:", response);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log("🔍 [Storage] Extension test hatası:", error);
      return false;
    }
  }

  // Extension ile senkronizasyon
  async syncWithExtension(extensionUUID) {
    try {
      if (extensionUUID.type === "permanent") {
        await this.setUserId(extensionUUID.uuid, "permanent");
      } else {
        await this.setUserId(extensionUUID.uuid, "guest");
      }
      console.log(
        "✅ [Storage] Extension ile senkronize edildi:",
        extensionUUID
      );
    } catch (error) {
      console.error("❌ [Storage] Extension senkronizasyon hatası:", error);
    }
  }

  // Extension storage'ından UUID oku (BİRİNCİL KAYNAK)
  async getExtensionStorage() {
    try {
      // Chrome extension kontrolü
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.id
      ) {
        console.log(
          "🔍 [Storage] Chrome extension tespit edildi, storage.local okunuyor..."
        );
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: "getActiveUUID" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log(
                  "❌ [Storage] Chrome extension mesaj hatası:",
                  chrome.runtime.lastError
                );
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            }
          );
        });

        if (response && response.uuid) {
          console.log(
            "✅ [Storage] Chrome storage.local'dan UUID alındı:",
            response.uuid
          );
          return response;
        } else {
          console.log("⚠️ [Storage] Chrome storage.local'da UUID bulunamadı");
        }
      }

      // Firefox extension kontrolü
      if (
        typeof browser !== "undefined" &&
        browser.runtime &&
        browser.runtime.id
      ) {
        console.log(
          "🔍 [Storage] Firefox extension tespit edildi, storage.local okunuyor..."
        );
        const response = await new Promise((resolve, reject) => {
          browser.runtime.sendMessage(
            { action: "getActiveUUID" },
            (response) => {
              if (browser.runtime.lastError) {
                console.log(
                  "❌ [Storage] Firefox extension mesaj hatası:",
                  browser.runtime.lastError
                );
                reject(browser.runtime.lastError);
              } else {
                resolve(response);
              }
            }
          );
        });

        if (response && response.uuid) {
          console.log(
            "✅ [Storage] Firefox storage.local'dan UUID alındı:",
            response.uuid
          );
          return response;
        } else {
          console.log("⚠️ [Storage] Firefox storage.local'da UUID bulunamadı");
        }
      }

      console.log(
        "ℹ️ [Storage] Extension tespit edilmedi, localStorage fallback kullanılacak"
      );
      return null;
    } catch (error) {
      console.error("❌ [Storage] Extension storage okuma hatası:", error);
      return null;
    }
  }
}

export default CrossBrowserStorageHelper;
