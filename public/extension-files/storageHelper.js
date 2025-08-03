// Storage Helper - Chrome Extension Storage API kullanarak cross-origin communication
console.log("🗄️ [Storage Helper] Yüklendi");

class ExtensionStorageHelper {
  constructor() {
    this.storageKey = "tum_listem_user_id";
    this.isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  // UUID'yi kaydet
  async setUserId(userId) {
    try {
      if (this.isExtension) {
        // Extension'da Chrome Storage API kullan
        await chrome.storage.local.set({ [this.storageKey]: userId });
        console.log("✅ [Extension] UUID Chrome Storage'a yazıldı:", userId);
        
        // Web sitesine event gönder
        this.notifyWebSite(userId);
      } else {
        // Web sitesinde localStorage'a yazma (extension UUID'si ezilmesin!)
        // Sadece extension yoksa localStorage'a yaz
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
          localStorage.setItem(this.storageKey, userId);
          console.log("✅ [Web Site] UUID localStorage'a yazıldı (extension yok):", userId);
        } else {
          console.log("⚠️ [Web Site] Extension mevcut, localStorage'a yazılmadı:", userId);
        }
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
      if (this.isExtension) {
        // Extension'da Chrome Storage API kullan
        const result = await chrome.storage.local.get([this.storageKey]);
        const userId = result[this.storageKey];
        console.log("🔍 [Extension] Chrome Storage'dan UUID okundu:", userId);
        return userId;
      } else {
        // Web sitesinde extension'dan mesaj gönder
        return await this.requestFromExtension();
      }
    } catch (error) {
      console.error("❌ [Storage] UUID okuma hatası:", error);
      return null;
    }
  }

  // Extension'dan UUID iste - Persistent storage'dan
  async requestFromExtension() {
    try {
      console.log("🔍 [Web Site] Extension'dan UUID isteniyor...");
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "getUserId" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("❌ [Web Site] Extension mesaj hatası:", chrome.runtime.lastError);
            reject(new Error("Extension bulunamadı"));
            return;
          }
          
          if (response && response.userId) {
            console.log("✅ [Web Site] Extension'dan UUID alındı:", response.userId);
            resolve(response.userId);
          } else {
            console.log("❌ [Web Site] Extension'dan UUID alınamadı");
            reject(new Error("UUID bulunamadı"));
          }
        });
      });
      
      return response;
    } catch (error) {
      console.log("❌ [Web Site] Extension mesajlaşma hatası:", error.message);
      
      // Fallback: localStorage'dan oku (eski sistem)
      const backupUserId = localStorage.getItem(this.storageKey);
      if (backupUserId) {
        console.log("🔄 [Web Site] Fallback: localStorage'dan UUID okundu:", backupUserId);
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
          detail: { userId: userId }
        })
      );
      console.log("📤 [Extension] extensionUserIdSet event gönderildi:", userId);
    } catch (error) {
      console.error("❌ [Extension] Event gönderme hatası:", error);
    }
  }

  // UUID'yi sil
  async deleteUserId() {
    try {
      if (this.isExtension) {
        await chrome.storage.local.remove([this.storageKey]);
        console.log("🗑️ [Extension] UUID Chrome Storage'dan silindi");
      } else {
        localStorage.removeItem(this.storageKey);
        console.log("🗑️ [Web Site] UUID localStorage'dan silindi");
      }
      return true;
    } catch (error) {
      console.error("❌ [Storage] UUID silme hatası:", error);
      return false;
    }
  }

  // Debug: Tüm storage'ı listele
  async debugStorage() {
    try {
      if (this.isExtension) {
        const allData = await chrome.storage.local.get(null);
        console.log("🔍 [Extension Debug] Chrome Storage:", allData);
        return allData;
      } else {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }
        console.log("🔍 [Web Site Debug] localStorage:", allData);
        return allData;
      }
    } catch (error) {
      console.error("❌ [Storage Debug] Hata:", error);
      return {};
    }
  }
}

// Global instance oluştur
window.ExtensionStorage = new ExtensionStorageHelper();

// Extension'da background script'e mesaj handler ekle
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getUserId") {
      window.ExtensionStorage.getUserId().then(userId => {
        sendResponse({ userId: userId });
      });
      return true; // Async response
    }
  });
}

console.log("🗄️ [Storage Helper] Hazır - Extension:", typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
