// Universal Background script for Tüm Listem Extension
// Browser API Detection
const browserAPI = (() => {
  if (typeof chrome !== "undefined" && chrome.runtime) {
    return chrome;
  } else if (typeof browser !== "undefined" && browser.runtime) {
    return browser;
  } else {
    return null;
  }
})();

if (browserAPI) {
  // Extension yüklendiğinde
  browserAPI.runtime.onInstalled.addListener(() => {
    const browserName = browserAPI === chrome ? "Chrome/Edge" : "Firefox";
    console.log(`🚀 [Tüm Listem] Extension yüklendi! (${browserName})`);
  });

  // Content script'ten gelen mesajları dinle
  browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getUserId") {
      // Backup sistemi ile UUID'yi al
      browserAPI.storage.local.get(
        ["tum_listem_user_id", "tum_listem_backup_uuid"],
        (result) => {
          let foundUUID = result.tum_listem_user_id;

          // Ana UUID yoksa backup'tan dene
          if (!foundUUID && result.tum_listem_backup_uuid) {
            console.log(
              "🔄 [Background] Ana UUID yok, backup UUID kullanılıyor:",
              result.tum_listem_backup_uuid
            );
            foundUUID = result.tum_listem_backup_uuid;

            // Backup'ı ana UUID'ye restore et
            browserAPI.storage.local.set(
              { tum_listem_user_id: foundUUID },
              () => {
                console.log("✅ [Background] Backup UUID restore edildi");
              }
            );
          }

          // Backup yoksa ve ana UUID varsa backup oluştur
          if (foundUUID && !result.tum_listem_backup_uuid) {
            console.log("💾 [Background] Backup UUID oluşturuluyor:", foundUUID);
            browserAPI.storage.local.set({ tum_listem_backup_uuid: foundUUID });
          }

          console.log("👤 [Background] UUID döndürülüyor:", foundUUID);
          sendResponse({ userId: foundUUID });
        }
      );
      return true; // Async response için
    }

    if (request.action === "setUserId") {
      browserAPI.storage.local.set(
        { tum_listem_user_id: request.userId },
        () => {
          // Backup'ı da güncelle
          browserAPI.storage.local.set({ tum_listem_backup_uuid: request.userId });
          console.log("💾 [Background] UUID ve backup güncellendi:", request.userId);
          sendResponse({ success: true });
        }
      );
      return true; // Async response için
    }
  });

  // Extension icon'a tıklandığında
  if (browserAPI.action) {
    // Manifest V3 (Chrome)
    browserAPI.action.onClicked.addListener((tab) => {
      browserAPI.tabs.sendMessage(tab.id, { action: "showProductInfo" });
    });
  } else if (browserAPI.browserAction) {
    // Manifest V2 (Firefox)
    browserAPI.browserAction.onClicked.addListener((tab) => {
      browserAPI.tabs.sendMessage(tab.id, { action: "showProductInfo" });
    });
  }
}
