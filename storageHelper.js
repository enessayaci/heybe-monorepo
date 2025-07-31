// Clean Extension Storage Helper - Sadece Chrome/Firefox Extension Storage API
(function () {
  "use strict";

  // Browser API Detection
  const browserAPI = (() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      return chrome;
    } else if (typeof browser !== "undefined" && browser.storage) {
      return browser;
    } else {
      throw new Error("Extension Storage API bulunamadı!");
    }
  })();

  // Extension Storage Class
  class ExtensionStorage {
    // Get data from extension storage
    async get(key) {
      return new Promise((resolve, reject) => {
        browserAPI.storage.local.get([key], (result) => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve(result[key] || null);
          }
        });
      });
    }

    // Set data in extension storage
    async set(key, value) {
      return new Promise((resolve, reject) => {
        const data = {};
        data[key] = value;
        browserAPI.storage.local.set(data, () => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve(true);
          }
        });
      });
    }

    // Remove data from extension storage
    async remove(key) {
      return new Promise((resolve, reject) => {
        browserAPI.storage.local.remove([key], () => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve(true);
          }
        });
      });
    }

    // Clear all extension storage
    async clear() {
      return new Promise((resolve, reject) => {
        browserAPI.storage.local.clear(() => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve(true);
          }
        });
      });
    }

    // Get browser name
    getBrowserName() {
      if (typeof chrome !== "undefined" && chrome.runtime) {
        return "Chrome/Edge";
      } else if (typeof browser !== "undefined" && browser.runtime) {
        return "Firefox";
      } else {
        return "Unknown";
      }
    }
  }

  // Global instance
  window.extensionStorage = new ExtensionStorage();

  console.log(
    `🔧 [Tüm Listem] Extension Storage yüklendi - Tarayıcı: ${window.extensionStorage.getBrowserName()}`
  );
})();
