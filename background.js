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
      browserAPI.storage.local.get(["tum_listem_user_id"], (result) => {
        sendResponse({ userId: result.tum_listem_user_id });
      });
      return true; // Async response için
    }

    if (request.action === "setUserId") {
      browserAPI.storage.local.set(
        { tum_listem_user_id: request.userId },
        () => {
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
