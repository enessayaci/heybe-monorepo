// Cross-Browser Storage Helper - Extension.js ile tüm tarayıcılarda çalışır
// console.log removed

class CrossBrowserStorageHelper {
  constructor() {
    this.storageKey = "tum_listem_user_id";
    this.isExtension =
      typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;
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
    return "unknown";
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
      default:
        return {
          set: (data) => chrome.storage.local.set(data),
          get: (keys) => chrome.storage.local.get(keys),
          remove: (keys) => chrome.storage.local.remove(keys),
          clear: () => chrome.storage.local.clear(),
        };
    }
  }

  // UUID'yi kaydet - Cross-browser
  async setUserId(userId) {
    try {
      if (this.isExtension) {
        // Extension'da cross-browser storage API kullan
        const storage = this.getStorageAPI();
        await storage.set({ [this.storageKey]: userId });
        console.log(
          `✅ [${this.browserType.toUpperCase()}] UUID kaydedildi:`,
          userId
        );

        // Web sitesine event gönder
        this.notifyWebSite(userId);
      } else {
        // Web sitesinde localStorage'a yazma (extension UUID'si ezilmesin!)
        // Sadece extension yoksa localStorage'a yaz
        if (
          typeof chrome === "undefined" ||
          !chrome.runtime ||
          !chrome.runtime.id
        ) {
          localStorage.setItem(this.storageKey, userId);
          console.log(
            "✅ [Web Site] UUID localStorage'a yazıldı (extension yok):",
            userId
          );
        } else {
          // console.log removed
        }
      }
      return true;
    } catch (error) {
      console.error(
        `❌ [${this.browserType.toUpperCase()}] UUID yazma hatası:`,
        error
      );
      return false;
    }
  }

  // UUID'yi oku - Cross-browser
  async getUserId() {
    try {
      if (this.isExtension) {
        // Extension'da cross-browser storage API kullan
        const storage = this.getStorageAPI();
        const result = await storage.get([this.storageKey]);
        const userId = result[this.storageKey];
        console.log(
          `✅ [${this.browserType.toUpperCase()}] UUID okundu:`,
          userId
        );
        return userId;
      } else {
        // Web sitesinde extension'dan mesaj gönder
        return await this.requestFromExtension();
      }
    } catch (error) {
      console.error(
        `❌ [${this.browserType.toUpperCase()}] UUID okuma hatası:`,
        error
      );
      return null;
    }
  }

  // Extension'dan UUID iste - Cross-browser
  async requestFromExtension() {
    try {
      console.log("🔄 [Web Site] Extension'dan UUID isteniyor...");

      const response = await new Promise((resolve, reject) => {
        // Cross-browser message API
        const messageAPI =
          typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

        messageAPI.sendMessage({ action: "getUserId" }, (response) => {
          const lastError =
            typeof browser !== "undefined"
              ? browser.runtime.lastError
              : chrome.runtime.lastError;

          if (lastError) {
            console.log("❌ [Web Site] Extension mesaj hatası:", lastError);
            reject(new Error("Extension bulunamadı"));
            return;
          }

          if (response && response.userId) {
            console.log(
              "✅ [Web Site] Extension'dan UUID alındı:",
              response.userId
            );
            resolve(response.userId);
          } else {
            console.log("❌ [Web Site] UUID bulunamadı");
            reject(new Error("UUID bulunamadı"));
          }
        });
      });

      return response;
    } catch (error) {
      console.log("❌ [Web Site] Extension'dan UUID alma hatası:", error);

      // Fallback: localStorage'dan oku (eski sistem)
      const backupUserId = localStorage.getItem(this.storageKey);
      if (backupUserId) {
        console.log(
          "🔄 [Web Site] Fallback: localStorage'dan UUID okundu:",
          backupUserId
        );
        return backupUserId;
      }

      return null;
    }
  }

  // Web sitesine event gönder
  notifyWebSite(userId) {
    try {
      // Content script üzerinden web sitesine event gönder
      window.dispatchEvent(
        new CustomEvent("extensionUserIdSet", {
          detail: { userId: userId, browser: this.browserType },
        })
      );
      console.log(
        `✅ [${this.browserType.toUpperCase()}] Web sitesine event gönderildi:`,
        userId
      );
    } catch (error) {
      console.error(
        `❌ [${this.browserType.toUpperCase()}] Event gönderme hatası:`,
        error
      );
    }
  }

  // UUID'yi sil - Cross-browser
  async deleteUserId() {
    try {
      if (this.isExtension) {
        const storage = this.getStorageAPI();
        await storage.remove([this.storageKey]);
        console.log(`✅ [${this.browserType.toUpperCase()}] UUID silindi`);
      } else {
        localStorage.removeItem(this.storageKey);
        console.log("✅ [Web Site] UUID localStorage'dan silindi");
      }
      return true;
    } catch (error) {
      console.error(
        `❌ [${this.browserType.toUpperCase()}] UUID silme hatası:`,
        error
      );
      return false;
    }
  }

  // Debug: Tüm storage'ı listele - Cross-browser
  async debugStorage() {
    try {
      if (this.isExtension) {
        const storage = this.getStorageAPI();
        const allData = await storage.get(null);
        console.log(
          `📊 [${this.browserType.toUpperCase()}] Tüm storage:`,
          allData
        );
        return allData;
      } else {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }
        console.log("📊 [Web Site] localStorage:", allData);
        return allData;
      }
    } catch (error) {
      console.error(
        `❌ [${this.browserType.toUpperCase()}] Storage Debug Hatası:`,
        error
      );
      return {};
    }
  }

  // Browser bilgisini getir
  getBrowserInfo() {
    return {
      type: this.browserType,
      isExtension: this.isExtension,
      storageKey: this.storageKey,
    };
  }
}

// Global instance oluştur
window.CrossBrowserStorage = new CrossBrowserStorageHelper();

// Extension'da background script'e mesaj handler ekle - Cross-browser
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
  const messageAPI =
    typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

  messageAPI.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getUserId") {
      window.CrossBrowserStorage.getUserId().then((userId) => {
        sendResponse({ userId: userId });
      });
      return true; // Async response
    }

    if (request.action === "getBrowserInfo") {
      sendResponse(window.CrossBrowserStorage.getBrowserInfo());
      return false; // Sync response
    }
  });
}

console.log(
  "🚀 Cross-Browser Storage Helper yüklendi:",
  window.CrossBrowserStorage.getBrowserInfo()
);
