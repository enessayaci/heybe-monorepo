// Content Script - Persistent UUID Bridge

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

// API helper function (CORS bypass için background script kullanır)
async function apiRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "apiRequest",
        method: method,
        endpoint: endpoint,
        data: data,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || "API isteği başarısız"));
        }
      }
    );
  });
}

// Aktif UUID'yi extension'dan al ve web sitesine gönder
async function sendActiveUUIDToWebSite() {
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getActiveUUID" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error("Extension bulunamadı"));
          return;
        }

        if (response && response.uuid) {
          resolve(response);
        } else {
          reject(new Error("UUID bulunamadı"));
        }
      });
    });

    // Web sitesine UUID'yi gönder
    sendActiveUUIDToPage(response);
  } catch (error) {
    // UUID alma hatası
  }
}

// Web sitesine aktif UUID'yi gönder
function sendActiveUUIDToPage(uuidData) {
  try {
    // Web sitesine event gönder
    window.dispatchEvent(
      new CustomEvent("extensionActiveUUIDSet", {
        detail: {
          uuid: uuidData.uuid,
          type: uuidData.type,
        },
      })
    );

    // Global variable'a da yaz (backup)
    window.EXTENSION_ACTIVE_UUID = uuidData.uuid;
    window.EXTENSION_UUID_TYPE = uuidData.type;
    window.EXTENSION_UUID_TIMESTAMP = Date.now();
  } catch (error) {
    // Web sitesine gönderme hatası
  }
}

// Web sitesinden gelen UUID'yi extension'a gönder
async function sendUUIDToExtension(uuid, type = "guest") {
  try {
    console.log("📤 [Content Script] UUID extension'a gönderiliyor:", {
      uuid,
      type,
    });

    const action = type === "permanent" ? "setPermanentUUID" : "setGuestUUID";
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: action,
          uuid: uuid,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log(
              "❌ [Content Script] Extension mesaj hatası:",
              chrome.runtime.lastError
            );
            reject(new Error("Extension bulunamadı"));
            return;
          }

          if (response && response.success) {
            console.log("✅ [Content Script] UUID extension'a gönderildi:", {
              uuid,
              type,
            });
            resolve(true);
          } else {
            // console.log removed
            reject(new Error("UUID kaydedilemedi"));
          }
        }
      );
    });

    return response;
  } catch (error) {
    // console.error removed
    return false;
  }
}

// Global değişkenler
let isRegistrationInProgress = false;
let pendingProductInfo = null;

// Ürün ekleme fonksiyonu - Guest/Permanent UUID kontrolü ile
async function addProductToMyList(productInfo) {
  try {
    // console.log removed

    // Eğer kayıt işlemi devam ediyorsa ürün bilgisini sakla ve bekle
    if (isRegistrationInProgress) {
      console.log(
        "⏳ [Content Script] Kayıt işlemi devam ediyor, ürün bekletiliyor...",
        "isRegistrationInProgress:",
        isRegistrationInProgress
      );
      pendingProductInfo = productInfo;
      showSuccessMessage("Kayıt işlemi tamamlandıktan sonra ürün eklenecek!");
      return true;
    }

    // Önce aktif UUID'yi al
    const uuidData = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getActiveUUID" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(
            "❌ [Content Script] Extension mesaj hatası:",
            chrome.runtime.lastError
          );
          reject(new Error("Extension bulunamadı"));
          return;
        }

        if (response && response.uuid) {
          // console.log removed
          resolve(response);
        } else {
          // console.log removed
          reject(new Error("UUID bulunamadı"));
        }
      });
    });

    // Guest kullanıcı ise uyarı göster (permanent kullanıcı değilse)
    if (uuidData.type === "guest") {
      console.log(
        "👤 [Content Script] Guest kullanıcı, uyarı popup'ı açılıyor..."
      );

      // Ürün ekleme işlemini beklet
      pendingProductInfo = productInfo;
      console.log("📦 [Content Script] Ürün bekletiliyor:", pendingProductInfo);

      const shouldContinue = await showGuestWarningPopup();
      if (!shouldContinue) {
        console.log("❌ [Content Script] Kullanıcı iptal etti");
        pendingProductInfo = null;
        return false;
      }
      console.log("✅ [Content Script] Kullanıcı devam etmeyi seçti");

      // Eğer kayıt/giriş işlemi devam ediyorsa ürünü beklet
      if (isRegistrationInProgress) {
        console.log(
          "⏳ [Content Script] Kayıt/Giriş işlemi devam ediyor, ürün bekletiliyor..."
        );
        showSuccessMessage("İşlem tamamlandıktan sonra ürün eklenecek!");
        return true;
      }

      // Guest kullanıcı için ürünü beklet - sadece yeni UUID ile eklenecek
      console.log(
        "⏳ [Content Script] Guest kullanıcı için ürün bekletiliyor..."
      );
      pendingProductInfo = productInfo;
      return true;
    }

    // Background script üzerinden API'ye ürün ekle (CORS bypass)
    try {
      const result = await apiRequest("POST", "add-product", {
        ...productInfo,
        user_id: uuidData.uuid,
      });

      // console.log removed

      if (result && result.success) {
        // console.log removed
        showSuccessMessage("Ürün Heybeye eklendi!");

        // Buton durumunu güncelle
        const addButton = document.getElementById("tum-listem-ekle-btn");
        if (addButton) {
          addButton.disabled = true;
          addButton.style.background = "white !important"; // Beyaz arka plan - !important ekle
          addButton.style.color = "#10b981"; // Yeşil metin

          const spanElement = addButton.querySelector("span");
          if (spanElement) {
            spanElement.textContent = "Ürün Eklendi";
            spanElement.style.color = "#10b981"; // Yeşil metin
          }

          const imgElement = addButton.querySelector("img");
          if (imgElement) {
            imgElement.src =
              "https://my-heybe.vercel.app/images/check-green.png";
          }

          // Progress bar oluştur
          const progressBar = document.createElement("div");
          progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #10b981;
            width: 0%;
            transition: width 2s ease-in-out;
            border-radius: 0 0 8px 8px;
            z-index: 1;
          `;
          addButton.appendChild(progressBar);

          // Progress bar'ı başlat
          setTimeout(() => {
            progressBar.style.width = "100%";
          }, 50);

          // 2 saniye sonra butonu geri döndür
          setTimeout(() => {
            addButton.disabled = false;
            addButton.style.background = "white";
            addButton.style.color = "#374151";

            if (spanElement) {
              spanElement.textContent = "Heybeye Ekle";
              spanElement.style.color = "#374151"; // Normal renk
            }

            // Logo geri gelsin
            const imgElement = addButton.querySelector("img");
            if (imgElement) {
              imgElement.src = "https://my-heybe.vercel.app/logo.png";
            }

            if (progressBar) {
              progressBar.remove();
            }
          }, 2000);
        }
        return true;
      } else {
        // console.log removed
        showErrorMessage("Ürün eklenirken hata oluştu!");
        return false;
      }
    } catch (error) {
      // console.error removed
      showErrorMessage("Ürün eklenirken hata oluştu!");
      return false;
    }
  } catch (error) {
    // console.error removed
    showErrorMessage("Ürün eklenirken hata oluştu!");
    return false;
  }
}

// Bekleyen ürünü ekle (kayıt sonrası çağrılır)
async function addPendingProduct() {
  if (pendingProductInfo) {
    console.log(
      "🔄 [Content Script] Bekleyen ürün ekleniyor:",
      pendingProductInfo
    );
    const productInfo = pendingProductInfo;
    pendingProductInfo = null;

    // Yeni permanent UUID ile ürün ekle
    const uuidData = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getActiveUUID" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error("Extension bulunamadı"));
          return;
        }
        resolve(response);
      });
    });

    // Kayıt sonrası yeni permanent UUID'yi kullan
    console.log(
      "🔄 [Content Script] Bekleyen ürün için UUID kontrolü:",
      uuidData
    );

    if (uuidData && uuidData.uuid) {
      console.log(
        "🆕 [Content Script] Yeni permanent UUID ile ürün ekleniyor:",
        uuidData.uuid
      );

      const result = await apiRequest("POST", "add-product", {
        ...productInfo,
        user_id: uuidData.uuid,
      });

      if (result) {
        console.log(
          "✅ [Content Script] Bekleyen ürün başarıyla eklendi:",
          result
        );
        showSuccessMessage("Ürün Tüm Listeme eklendi!");
      } else {
        // console.log removed
        showErrorMessage("Ürün eklenirken hata oluştu!");
      }
    } else {
      console.log(
        "❌ [Content Script] UUID bulunamadı, bekleyen ürün eklenemedi"
      );
      showErrorMessage("UUID bulunamadı, ürün eklenemedi!");
    }
  }
}

// Bekleyen ürünü belirli UUID ile ekle (kayıt sonrası çağrılır)
async function addPendingProductWithUUID(uuid) {
  console.log(
    "🔍 [Content Script] addPendingProductWithUUID çağrıldı, pendingProductInfo:",
    pendingProductInfo,
    "UUID:",
    uuid
  );

  if (pendingProductInfo) {
    console.log(
      "🔄 [Content Script] Bekleyen ürün belirli UUID ile ekleniyor:",
      pendingProductInfo,
      "UUID:",
      uuid
    );
    const productInfo = pendingProductInfo;
    pendingProductInfo = null;

    try {
      const result = await apiRequest("POST", "add-product", {
        ...productInfo,
        user_id: uuid,
      });

      // console.log removed

      if (result && result.success) {
        console.log(
          "✅ [Content Script] Bekleyen ürün başarıyla eklendi:",
          result
        );
        showSuccessMessage("Ürün Heybeye eklendi!");

        // Buton durumunu güncelle
        const addButton = document.getElementById("tum-listem-ekle-btn");
        if (addButton) {
          addButton.disabled = true;
          addButton.style.background = "white !important"; // Beyaz arka plan - !important ekle
          addButton.style.color = "#10b981"; // Yeşil metin

          const spanElement = addButton.querySelector("span");
          if (spanElement) {
            spanElement.textContent = "Ürün Eklendi";
            spanElement.style.color = "#10b981"; // Yeşil metin
          }

          const imgElement = addButton.querySelector("img");
          if (imgElement) {
            imgElement.src =
              "https://my-heybe.vercel.app/images/check-green.png";
          }

          // Progress bar oluştur
          const progressBar = document.createElement("div");
          progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #10b981;
            width: 0%;
            transition: width 2s ease-in-out;
            border-radius: 0 0 8px 8px;
            z-index: 1;
          `;
          addButton.appendChild(progressBar);

          // Progress bar'ı başlat
          setTimeout(() => {
            progressBar.style.width = "100%";
          }, 50);

          // 2 saniye sonra butonu geri döndür
          setTimeout(() => {
            addButton.disabled = false;
            addButton.style.background = "white";
            addButton.style.color = "#374151";

            if (spanElement) {
              spanElement.textContent = "Heybeye Ekle";
              spanElement.style.color = "#374151"; // Normal renk
            }

            // Logo geri gelsin
            const imgElement = addButton.querySelector("img");
            if (imgElement) {
              imgElement.src = "https://my-heybe.vercel.app/logo.png";
            }

            if (progressBar) {
              progressBar.remove();
            }
          }, 2000);
        }
      } else {
        // console.log removed
        showErrorMessage("Ürün eklenirken hata oluştu!");
      }
    } catch (error) {
      console.error(
        "❌ [Content Script] Bekleyen ürün ekleme exception:",
        error
      );
      showErrorMessage("Ürün eklenirken hata oluştu!");
    }
  } else {
    console.log(
      "❌ [Content Script] Bekleyen ürün bulunamadı, pendingProductInfo boş"
    );
  }
}

// Guest kullanıcılar için uyarı popup'ı
function showGuestWarningPopup() {
  return new Promise((resolve) => {
    // Popup container oluştur
    const popup = document.createElement("div");
    popup.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 999999;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;

    // Popup content
    const content = document.createElement("div");
    content.style.cssText = `
                  background: white;
                  border-radius: 12px;
                  padding: 24px;
                  max-width: 400px;
                  margin: 20px;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                  text-align: center;
                `;

    // Icon
    const icon = document.createElement("div");
    icon.style.cssText = `
                  width: 48px;
                  height: 48px;
                  background: #fef3c7;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 16px;
                `;
    icon.innerHTML = `
                  <svg width="24" height="24" fill="none" stroke="#d97706" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                `;

    // Title
    const title = document.createElement("h3");
    title.style.cssText = `
                  font-size: 18px;
                  font-weight: 600;
                  color: #1f2937;
                  margin: 0 0 12px;
                `;
    title.textContent = "Misafir Kullanıcı";

    // Message
    const message = document.createElement("p");
    message.style.cssText = `
                  font-size: 14px;
                  color: #6b7280;
                  margin: 0 0 24px;
                  line-height: 1.5;
                `;
    message.textContent =
      "Henüz giriş yapmadınız. Ürünleriniz geçici olarak saklanacak ve kısıtlı özellikler mevcut. Kalıcı hesap oluşturmak için giriş yapın veya misafir olarak devam edin.";

    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
                  display: flex;
                  gap: 12px;
                `;

    // Login button
    const loginButton = document.createElement("button");
    loginButton.style.cssText = `
                  flex: 1;
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 12px 16px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background 0.2s;
                `;
    loginButton.textContent = "Giriş Yap";
    loginButton.onmouseover = () => (loginButton.style.background = "#1d4ed8");
    loginButton.onmouseout = () => (loginButton.style.background = "#2563eb");
    loginButton.onclick = () => {
      document.body.removeChild(popup);
      // Kayıt işlemi başladığını işaretle
      isRegistrationInProgress = true;
      console.log(
        "🔐 [Content Script] Giriş Yap butonuna tıklandı, isRegistrationInProgress = true"
      );
      showLoginOrRegisterForm().then((result) => {
        resolve(result);
      });
    };

    // Continue as guest button
    const guestButton = document.createElement("button");
    guestButton.style.cssText = `
                  flex: 1;
                  background: #f3f4f6;
                  color: #374151;
                  border: none;
                  padding: 12px 16px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background 0.2s;
                `;
    guestButton.textContent = "Misafir Olarak Devam Et";
    guestButton.onmouseover = () => (guestButton.style.background = "#e5e7eb");
    guestButton.onmouseout = () => (guestButton.style.background = "#f3f4f6");
    guestButton.onclick = async () => {
      document.body.removeChild(popup);

      // Misafir olarak devam et seçildi, bekleyen ürünü guest UUID ile ekle
      if (pendingProductInfo) {
        console.log(
          "👤 [Content Script] Misafir olarak devam et seçildi, ürün ekleniyor..."
        );

        try {
          // Aktif UUID'yi al (guest UUID)
          const uuidData = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { action: "getActiveUUID" },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error("Extension bulunamadı"));
                  return;
                }
                resolve(response);
              }
            );
          });

          if (uuidData && uuidData.uuid) {
            // Guest UUID ile ürün ekle
            const result = await apiRequest("POST", "add-product", {
              ...pendingProductInfo,
              user_id: uuidData.uuid,
            });

            if (result && result.success) {
              console.log(
                "✅ [Content Script] Misafir kullanıcı ürünü başarıyla eklendi"
              );
              showSuccessMessage("Ürün Heybeye eklendi!");

              // Buton durumunu güncelle
              const addButton = document.getElementById("tum-listem-ekle-btn");
              if (addButton) {
                addButton.disabled = true;
                addButton.style.background = "white !important"; // Beyaz arka plan - !important ekle
                addButton.style.color = "#10b981"; // Yeşil metin

                const spanElement = addButton.querySelector("span");
                if (spanElement) {
                  spanElement.textContent = "Ürün Eklendi";
                  spanElement.style.color = "#10b981"; // Yeşil metin
                }

                const imgElement = addButton.querySelector("img");
                if (imgElement) {
                  imgElement.src =
                    "https://my-heybe.vercel.app/images/check-green.png";
                }

                // Progress bar oluştur
                const progressBar = document.createElement("div");
                progressBar.style.cssText = `
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  height: 3px;
                  background: #10b981;
                  width: 0%;
                  transition: width 2s ease-in-out;
                  border-radius: 0 0 8px 8px;
                  z-index: 1;
                `;
                addButton.appendChild(progressBar);

                // Progress bar'ı başlat
                setTimeout(() => {
                  progressBar.style.width = "100%";
                }, 50);

                // 2 saniye sonra butonu geri döndür
                setTimeout(() => {
                  addButton.disabled = false;
                  addButton.style.background = "white";
                  addButton.style.color = "#374151";

                  if (spanElement) {
                    spanElement.textContent = "Heybeye Ekle";
                    spanElement.style.color = "#374151"; // Normal renk
                  }

                  // Logo geri gelsin
                  const imgElement = addButton.querySelector("img");
                  if (imgElement) {
                    imgElement.src = "https://my-heybe.vercel.app/logo.png";
                  }

                  if (progressBar) {
                    progressBar.remove();
                  }
                }, 2000);
              }
            } else {
              showErrorMessage("Ürün eklenirken hata oluştu!");
            }
          }
        } catch (error) {
          console.error(
            "❌ [Content Script] Misafir ürün ekleme hatası:",
            error
          );
          showErrorMessage("Ürün eklenirken hata oluştu!");
        }

        // Bekleyen ürünü temizle
        pendingProductInfo = null;
      }

      resolve(true);
    };

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.style.cssText = `
                  width: 100%;
                  background: transparent;
                  color: #6b7280;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-size: 13px;
                  cursor: pointer;
                  margin-top: 12px;
                  transition: background 0.2s;
                `;
    cancelButton.textContent = "İptal";
    cancelButton.onmouseover = () =>
      (cancelButton.style.background = "#f9fafb");
    cancelButton.onmouseout = () =>
      (cancelButton.style.background = "transparent");
    cancelButton.onclick = () => {
      document.body.removeChild(popup);
      resolve(false);
    };

    // Assemble popup
    content.appendChild(icon);
    content.appendChild(title);
    content.appendChild(message);
    buttonsContainer.appendChild(loginButton);
    buttonsContainer.appendChild(guestButton);
    content.appendChild(buttonsContainer);
    content.appendChild(cancelButton);
    popup.appendChild(content);

    // Add to page
    document.body.appendChild(popup);

    // Close on outside click
    popup.onclick = (e) => {
      if (e.target === popup) {
        document.body.removeChild(popup);
        resolve(false);
      }
    };
  });
}

// Login veya Register form popup'ı
function showLoginOrRegisterForm() {
  return new Promise((resolve) => {
    // Popup container oluştur
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Popup content
    const content = document.createElement("div");
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
    `;

    // Title
    const title = document.createElement("h3");
    title.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 24px;
      text-align: center;
    `;
    title.textContent = "Giriş Yap / Kayıt Ol";

    // Form
    const form = document.createElement("form");
    form.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    // Email input
    const emailLabel = document.createElement("label");
    emailLabel.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 4px;
    `;
    emailLabel.textContent = "E-posta";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.required = true;
    emailInput.style.cssText = `
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
    `;
    emailInput.placeholder = "ornek@email.com";
    emailInput.onfocus = () => (emailInput.style.borderColor = "#2563eb");
    emailInput.onblur = () => (emailInput.style.borderColor = "#d1d5db");

    // Password input
    const passwordLabel = document.createElement("label");
    passwordLabel.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 4px;
    `;
    passwordLabel.textContent = "Şifre";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.required = true;
    passwordInput.style.cssText = `
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
    `;
    passwordInput.placeholder = "Şifrenizi girin";
    passwordInput.onfocus = () => (passwordInput.style.borderColor = "#2563eb");
    passwordInput.onblur = () => (passwordInput.style.borderColor = "#d1d5db");

    // Error message
    const errorMessage = document.createElement("div");
    errorMessage.style.cssText = `
      color: #dc2626;
      font-size: 14px;
      text-align: center;
      min-height: 20px;
      display: none;
    `;

    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 12px;
      margin-top: 8px;
    `;

    // Login button
    const loginButton = document.createElement("button");
    loginButton.type = "button";
    loginButton.style.cssText = `
      flex: 1;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `;
    loginButton.textContent = "Giriş Yap";
    loginButton.onmouseover = () => (loginButton.style.background = "#1d4ed8");
    loginButton.onmouseout = () => (loginButton.style.background = "#2563eb");

    // Register button
    const registerButton = document.createElement("button");
    registerButton.type = "button";
    registerButton.style.cssText = `
      flex: 1;
      background: #059669;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `;
    registerButton.textContent = "Kayıt Ol";
    registerButton.onmouseover = () =>
      (registerButton.style.background = "#047857");
    registerButton.onmouseout = () =>
      (registerButton.style.background = "#059669");

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.style.cssText = `
      width: 100%;
      background: #f3f4f6;
      color: #374151;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 12px;
    `;
    cancelButton.textContent = "İptal";
    cancelButton.onmouseover = () =>
      (cancelButton.style.background = "#e5e7eb");
    cancelButton.onmouseout = () => (cancelButton.style.background = "#f3f4f6");
    cancelButton.onclick = () => {
      document.body.removeChild(popup);
      resolve(false);
    };

    // Login button click handler
    loginButton.onclick = async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorMessage.textContent = "Lütfen email ve şifre girin";
        errorMessage.style.display = "block";
        return;
      }

      // Loading state
      loginButton.textContent = "Giriş yapılıyor...";
      loginButton.disabled = true;
      registerButton.disabled = true;
      errorMessage.style.display = "none";

      // Giriş işlemi başladı - ürün eklemeyi beklet
      isRegistrationInProgress = true;

      try {
        // Misafir UUID'yi al
        const guestUUID = await new Promise((resolve) => {
          chrome.storage.local.get(["tum_listem_guest_uuid"], (result) => {
            resolve(result.tum_listem_guest_uuid);
          });
        });

        // Background script üzerinden API'ye giriş isteği gönder (CORS bypass)
        const result = await apiRequest("POST", "login", {
          email: email,
          password: password,
          guest_user_id: guestUUID || null,
        });

        if (result && result.uuid) {
          console.log("✅ [API Response] Login başarılı:", result);
          // Permanent UUID'yi extension'a set et
          await sendUUIDToExtension(result.uuid, "permanent");
          console.log(
            "✅ [Content Script] Login başarılı, permanent UUID set edildi:",
            result.uuid
          );

          document.body.removeChild(popup);

          // Login işlemi tamamlandı, bekleyen ürünü ekle
          isRegistrationInProgress = false;
          await addPendingProductWithUUID(result.uuid);

          resolve(true);
        } else {
          console.log("❌ [API Response] Login başarısız:", result);
          errorMessage.textContent = result.error || "Giriş başarısız";
          errorMessage.style.display = "block";
          loginButton.textContent = "Giriş Yap";
          loginButton.disabled = false;
          registerButton.disabled = false;
          isRegistrationInProgress = false;
        }
      } catch (error) {
        console.log("❌ [API Error] Login hatası:", error.message);
        if (error.message && error.message.includes("400")) {
          errorMessage.textContent = "Geçerli bir email adresi girin";
        } else if (error.message && error.message.includes("401")) {
          errorMessage.textContent = "Email veya şifre hatalı";
        } else {
          errorMessage.textContent = "Bağlantı hatası";
        }
        errorMessage.style.display = "block";
        loginButton.textContent = "Giriş Yap";
        loginButton.disabled = false;
        registerButton.disabled = false;
        isRegistrationInProgress = false;
      }
    };

    // Register button click handler
    registerButton.onclick = async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorMessage.textContent = "Lütfen email ve şifre girin";
        errorMessage.style.display = "block";
        return;
      }

      if (password.length < 6) {
        errorMessage.textContent = "Şifre en az 6 karakter olmalı";
        errorMessage.style.display = "block";
        return;
      }

      // Loading state
      loginButton.disabled = true;
      registerButton.textContent = "Kayıt yapılıyor...";
      registerButton.disabled = true;
      errorMessage.style.display = "none";

      // Kayıt işlemi zaten başladı (showGuestWarningPopup'ta set edildi)

      try {
        // Misafir UUID'yi al
        const guestUUID = await new Promise((resolve) => {
          chrome.storage.local.get(["tum_listem_guest_uuid"], (result) => {
            resolve(result.tum_listem_guest_uuid);
          });
        });

        // Background script üzerinden API'ye kayıt isteği gönder (CORS bypass)
        const result = await apiRequest("POST", "register", {
          email: email,
          password: password,
          guest_user_id: guestUUID || null,
        });

        if (result && result.uuid) {
          console.log("✅ [API Response] Register başarılı:", result);
          // Permanent UUID'yi extension'a set et
          await sendUUIDToExtension(result.uuid, "permanent");
          console.log(
            "✅ [Content Script] Kayıt başarılı, permanent UUID set edildi:",
            result.uuid
          );

          document.body.removeChild(popup);

          // Kayıt işlemi tamamlandı, bekleyen ürünü ekle
          isRegistrationInProgress = false;
          await addPendingProductWithUUID(result.uuid);

          return true;
        } else if (result && result.error && result.error.includes("409")) {
          console.log(
            "🔄 [API Response] Kullanıcı zaten var, login deneniyor:",
            result
          );
          // Kullanıcı zaten kayıtlı, login dene
          console.log(
            "🔄 [Content Script] Kullanıcı zaten kayıtlı, login deneniyor..."
          );

          try {
            const loginResult = await apiRequest("POST", "login", {
              email: email,
              password: password,
              guest_user_id: guestUUID || null,
            });

            if (loginResult && loginResult.uuid) {
              console.log(
                "✅ [API Response] Auto-login başarılı:",
                loginResult
              );
              // Permanent UUID'yi extension'a set et
              await sendUUIDToExtension(loginResult.uuid, "permanent");
              console.log(
                "✅ [Content Script] Login başarılı, permanent UUID set edildi:",
                loginResult.uuid
              );

              document.body.removeChild(popup);

              // Login işlemi tamamlandı, bekleyen ürünü ekle
              isRegistrationInProgress = false;
              await addPendingProductWithUUID(loginResult.uuid);

              return true;
            } else {
              console.log(
                "❌ [API Response] Auto-login başarısız:",
                loginResult
              );
              errorMessage.textContent = "Email veya şifre hatalı";
              errorMessage.style.display = "block";
              loginButton.disabled = false;
              registerButton.textContent = "Kayıt Ol";
              registerButton.disabled = false;
              isRegistrationInProgress = false;
              return false;
            }
          } catch (loginError) {
            console.log(
              "❌ [API Error] Auto-login hatası:",
              loginError.message
            );
            errorMessage.textContent = "Email veya şifre hatalı";
            errorMessage.style.display = "block";
            loginButton.disabled = false;
            registerButton.textContent = "Kayıt Ol";
            registerButton.disabled = false;
            isRegistrationInProgress = false;
            return false;
          }
        } else {
          console.log("❌ [API Response] Register başarısız:", result);
          errorMessage.textContent = result.error || "Kayıt başarısız";
          errorMessage.style.display = "block";
          loginButton.disabled = false;
          registerButton.textContent = "Kayıt Ol";
          registerButton.disabled = false;
          isRegistrationInProgress = false;
          return false;
        }
      } catch (error) {
        console.log("❌ [API Error] Register hatası:", error.message);
        if (error.message && error.message.includes("400")) {
          errorMessage.textContent = "Geçerli bir email adresi girin";
        } else if (error.message && error.message.includes("409")) {
          errorMessage.textContent = "Bu kullanıcı zaten var";
        } else if (error.message && error.message.includes("401")) {
          errorMessage.textContent = "Email veya şifre hatalı";
        } else {
          errorMessage.textContent = "Bağlantı hatası";
        }
        errorMessage.style.display = "block";
        loginButton.disabled = false;
        registerButton.textContent = "Kayıt Ol";
        registerButton.disabled = false;
        isRegistrationInProgress = false;
        return false;
      }
    };

    // Assemble form
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(passwordLabel);
    form.appendChild(passwordInput);
    form.appendChild(errorMessage);
    buttonsContainer.appendChild(loginButton);
    buttonsContainer.appendChild(registerButton);
    form.appendChild(buttonsContainer);
    form.appendChild(cancelButton);

    // Assemble popup
    content.appendChild(title);
    content.appendChild(form);
    popup.appendChild(content);

    // Add to page
    document.body.appendChild(popup);

    // Focus email input
    emailInput.focus();

    // Close on outside click
    popup.onclick = (e) => {
      if (e.target === popup) {
        document.body.removeChild(popup);
        resolve(false);
      }
    };
  });
}

// Başarı mesajı göster
function showSuccessMessage(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

// Hata mesajı göster
function showErrorMessage(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

// Web sitesinden gelen mesajları dinle
window.addEventListener("message", (event) => {
  // Sadece aynı origin'den gelen mesajları kabul et
  if (event.source !== window) return;

  if (event.data.type === "SET_GUEST_UUID") {
    console.log(
      "📨 [Content Script] Web sitesinden Guest UUID mesajı alındı:",
      event.data.uuid
    );
    sendUUIDToExtension(event.data.uuid, "guest");
  }

  if (event.data.type === "SET_PERMANENT_UUID") {
    console.log(
      "📨 [Content Script] Web sitesinden Permanent UUID mesajı alındı:",
      event.data.uuid
    );
    sendUUIDToExtension(event.data.uuid, "permanent");
  }

  if (event.data.type === "GET_ACTIVE_UUID") {
    // console.log removed
    sendActiveUUIDToWebSite();
  }

  if (event.data.type === "ADD_PRODUCT") {
    console.log(
      "📨 [Content Script] Web sitesinden ürün ekleme isteği alındı:",
      event.data.product
    );
    addProductToMyList(event.data.product);
  }

  if (
    event.data.type === "SEND_PERMANENT_UUID" &&
    event.data.source === "web-site"
  ) {
    console.log(
      "📨 [Content Script] Web sitesinden permanent UUID alındı:",
      event.data.uuid
    );
    sendUUIDToExtension(event.data.uuid, "permanent");
  }
});

// Background script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "guestUUIDChanged") {
    console.log(
      "📨 [Content Script] Background'dan Guest UUID değişikliği:",
      request.uuid
    );
    sendActiveUUIDToPage({ uuid: request.uuid, type: "guest" });
  }

  if (request.action === "permanentUUIDChanged") {
    console.log(
      "📨 [Content Script] Background'dan Permanent UUID değişikliği:",
      request.uuid
    );
    sendActiveUUIDToPage({ uuid: request.uuid, type: "permanent" });
  }

  if (request.action === "loginStatusChanged") {
    console.log(
      "📨 [Content Script] Background'dan login status değişikliği:",
      request.isLoggedIn
    );
    // Web sitesine login status değişikliğini bildir
    window.dispatchEvent(
      new CustomEvent("extensionLoginStatusChanged", {
        detail: { isLoggedIn: request.isLoggedIn },
      })
    );
  }
});

// Ürün bilgilerini çek
function getProductInfo() {
  try {
    // Meta tag'lerden bilgi çek
    const metaTags = {};
    document.querySelectorAll("meta").forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");
      if (name && content) {
        metaTags[name.toLowerCase()] = content;
      }
    });

    // Ürün adı
    let productName =
      metaTags["og:title"] ||
      metaTags["twitter:title"] ||
      metaTags.title ||
      document.title ||
      "Ürün";

    // Fiyat
    let price = "";
    const priceSelectors = [
      '[class*="price"]',
      '[class*="fiyat"]',
      '[class*="cost"]',
      '[class*="amount"]',
      "span",
      "div",
      "p",
    ];

    for (const selector of priceSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.trim();
        if (
          text.match(/[\d.,]+\s*(₺|TL|\$|€)/) ||
          text.match(/(₺|TL|\$|€)\s*[\d.,]+/)
        ) {
          price = text.replace(/[^\d.,]/g, "").trim();
          break;
        }
      }
      if (price) break;
    }

    // Resim
    let imageUrl =
      metaTags["og:image"] || metaTags["twitter:image"] || metaTags.image || "";

    if (!imageUrl) {
      const images = document.querySelectorAll("img");
      for (const img of images) {
        const src = img.src || img.getAttribute("data-src");
        if (
          src &&
          src.length > 100 &&
          !src.includes("logo") &&
          !src.includes("icon")
        ) {
          imageUrl = src;
          break;
        }
      }
    }

    return {
      name: productName,
      price: price,
      image_url: imageUrl,
      url: window.location.href,
      site: window.location.hostname,
    };
  } catch (error) {
    // console.error removed
    return {
      name: "Ürün",
      price: "",
      image_url: "",
      url: window.location.href,
      site: window.location.hostname,
    };
  }
}

// "Tüm Listeme Ekle" butonunu oluştur ve ekle
function createAddToListButton() {
  // Eğer buton zaten varsa ekleme
  if (document.getElementById("tum-listem-ekle-btn")) {
    return;
  }

  // Ana sayfa kontrolü - ana sayfada buton gösterme
  const isHomePage =
    window.location.pathname === "/" ||
    window.location.pathname === "/home" ||
    window.location.pathname === "/anasayfa" ||
    document.title.toLowerCase().includes("ana sayfa") ||
    document.title.toLowerCase().includes("homepage");

  // Heybe website'inde buton gösterme
  const isHeybeWebsite =
    window.location.hostname === "my-heybe.vercel.app" ||
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("vercel.app");

  if (isHomePage || isHeybeWebsite) {
    return;
  }

  // İlgili buton var mı kontrol et
  const relevantButtons = Array.from(
    document.querySelectorAll(
      "button, a, input[type='button'], div[role='button']"
    )
  );
  const hasRelevantButton = relevantButtons.some((btn) => {
    const text = (btn.innerText || btn.value || "").toLowerCase();
    return (
      text.includes("sepete ekle") ||
      text.includes("add to cart") ||
      text.includes("buy") ||
      text.includes("satın al")
    );
  });

  if (!hasRelevantButton) {
    return;
  }

  // Ana buton container'ı oluştur
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "tum-listem-buttons";
  buttonContainer.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    z-index: 99999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    border-radius: 24px 0 0 24px;
    overflow: visible;
    margin-right: -280px;
    transition: margin-right 0.3s cubic-bezier(.4,0,.2,1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Sol taraf - "Tüm Listeme Ekle" butonu
  const addButton = document.createElement("button");
  addButton.id = "tum-listem-ekle-btn";
  addButton.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <img src="https://my-heybe.vercel.app/logo.png" width="20" height="20" style="object-fit: contain;">
      <span>Heybeye Ekle</span>
    </div>
  `;

  addButton.style.cssText = `
    background: white;
    color: #374151;
    padding: 0 24px 0 12px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    height: 48px;
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
    position: relative;
  `;

  // Sağ taraf - "Listeyi Gör" butonu (sarı)
  const viewButton = document.createElement("button");
  viewButton.id = "tum-listem-gor-btn";
  viewButton.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span>Listeyi Gör</span>
    </div>
  `;

  viewButton.style.cssText = `
    background: #f59e0b;
    color: white;
    padding: 0 16px 0 8px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    height: 48px;
    width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    white-space: nowrap;
  `;

  // Hover efektleri
  buttonContainer.addEventListener("mouseenter", () => {
    buttonContainer.style.marginRight = "0px";
  });

  buttonContainer.addEventListener("mouseleave", () => {
    buttonContainer.style.marginRight = "-280px";
  });

  // "Tüm Listeme Ekle" tıklama olayı
  addButton.addEventListener("click", async () => {
    try {
      // Buton durumunu güncelle
      addButton.disabled = true;
      addButton.querySelector("span").textContent = "Ekleniyor...";

      // Ürün bilgilerini al
      const productInfo = getProductInfo();
      // console.log removed

      // Ürün ekleme fonksiyonunu çağır
      const success = await addProductToMyList(productInfo);

      if (success) {
        // console.log removed
        // Ürün başarıyla eklendiyse buton durumunu güncelle
        addButton.disabled = true;
        addButton.style.background = "white !important"; // Beyaz arka plan - !important ekle
        addButton.style.color = "#10b981"; // Yeşil metin

        const spanElement = addButton.querySelector("span");
        if (spanElement) {
          spanElement.textContent = "Ürün Eklendi";
        }

        const svgElement = addButton.querySelector("svg");
        if (svgElement) {
          svgElement.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          `;
        }
      } else {
        // console.log removed
        // Hata durumunda buton durumunu geri al
        addButton.disabled = false;
        addButton.querySelector("span").textContent = "Heybeye Ekle";
      }
    } catch (error) {
      // console.error removed
      showErrorMessage("Ürün eklenirken hata oluştu!");
      // Hata durumunda buton durumunu geri al
      addButton.disabled = false;
      addButton.querySelector("span").textContent = "Heybeye Ekle";
    }
  });

  // "Listeyi Gör" tıklama olayı
  viewButton.addEventListener("click", () => {
    window.open("https://my-heybe.vercel.app", "_blank");
  });

  // Butonları container'a ekle
  buttonContainer.appendChild(addButton);
  buttonContainer.appendChild(viewButton);

  // Sayfaya ekle
  document.body.appendChild(buttonContainer);
  console.log(
    "✅ [Content Script] 'Tüm Listeme Ekle' ve 'Listeyi Gör' butonları eklendi"
  );
}

// Sayfa yüklendiğinde aktif UUID'yi gönder ve buton ekle
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log(
      "🚀 [Content Script] Sayfa yüklendi, aktif UUID gönderiliyor..."
    );
    setTimeout(() => {
      sendActiveUUIDToWebSite();
      createAddToListButton();
    }, 1000); // 1 saniye bekle
  });
} else {
  console.log(
    "🚀 [Content Script] Sayfa zaten yüklü, aktif UUID gönderiliyor..."
  );
  setTimeout(() => {
    sendActiveUUIDToWebSite();
    createAddToListButton();
  }, 1000); // 1 saniye bekle
}

// Web sitesine helper fonksiyonları ekle
window.postMessage(
  {
    type: "EXTENSION_READY",
    data: {
      hasExtension: true,
      extensionId: chrome.runtime.id,
    },
  },
  "*"
);

// console.log removed
