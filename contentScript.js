// Content Script - Extension ve Web Sitesi arasında köprü
console.log("🌐 [Content Script] Yüklendi");

// UUID'yi extension'dan al ve web sitesine gönder
async function sendUserIdToWebSite() {
  try {
    console.log("🔍 [Content Script] Extension'dan UUID alınıyor...");
    
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getUserId" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("❌ [Content Script] Extension mesaj hatası:", chrome.runtime.lastError);
          reject(new Error("Extension bulunamadı"));
          return;
        }
        
        if (response && response.userId) {
          console.log("✅ [Content Script] Extension'dan UUID alındı:", response.userId);
          resolve(response.userId);
        } else {
          console.log("❌ [Content Script] Extension'dan UUID alınamadı");
          reject(new Error("UUID bulunamadı"));
        }
      });
    });
    
    // Web sitesine UUID'yi gönder
    sendUserIdToPage(response);
    
  } catch (error) {
    console.log("❌ [Content Script] UUID alma hatası:", error.message);
  }
}

// Web sitesine UUID'yi gönder
function sendUserIdToPage(userId) {
  try {
    console.log("📤 [Content Script] UUID web sitesine gönderiliyor:", userId);
    
    // Web sitesine event gönder
    window.dispatchEvent(
      new CustomEvent("extensionUserIdSet", {
        detail: { userId: userId }
      })
    );
    
    // Global variable'a da yaz (backup)
    window.EXTENSION_USER_ID = userId;
    window.EXTENSION_USER_ID_TIMESTAMP = Date.now();
    
    console.log("✅ [Content Script] UUID web sitesine gönderildi:", userId);
  } catch (error) {
    console.error("❌ [Content Script] Web sitesine gönderme hatası:", error);
  }
}

// Web sitesinden gelen UUID'yi extension'a gönder
async function sendUserIdToExtension(userId) {
  try {
    console.log("📤 [Content Script] UUID extension'a gönderiliyor:", userId);
    
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ 
        action: "setUserId", 
        userId: userId 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("❌ [Content Script] Extension mesaj hatası:", chrome.runtime.lastError);
          reject(new Error("Extension bulunamadı"));
          return;
        }
        
        if (response && response.success) {
          console.log("✅ [Content Script] UUID extension'a gönderildi:", userId);
          resolve(true);
        } else {
          console.log("❌ [Content Script] UUID extension'a gönderilemedi");
          reject(new Error("UUID kaydedilemedi"));
        }
      });
    });
    
    return response;
  } catch (error) {
    console.error("❌ [Content Script] Extension'a gönderme hatası:", error);
    return false;
  }
}

// Web sitesinden gelen mesajları dinle
window.addEventListener("message", (event) => {
  // Sadece aynı origin'den gelen mesajları kabul et
  if (event.source !== window) return;
  
  if (event.data.type === "SET_USER_ID") {
    console.log("📨 [Content Script] Web sitesinden UUID mesajı alındı:", event.data.userId);
    sendUserIdToExtension(event.data.userId);
  }
  
  if (event.data.type === "GET_USER_ID") {
    console.log("📨 [Content Script] Web sitesinden UUID isteği alındı");
    sendUserIdToWebSite();
  }
});

// Background script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "userIdChanged") {
    console.log("📨 [Content Script] Background'dan UUID değişikliği:", request.userId);
    sendUserIdToPage(request.userId);
  }
});

// Sayfa yüklendiğinde UUID'yi gönder
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 [Content Script] Sayfa yüklendi, UUID gönderiliyor...");
    setTimeout(sendUserIdToWebSite, 1000); // 1 saniye bekle
  });
} else {
  console.log("🚀 [Content Script] Sayfa zaten yüklü, UUID gönderiliyor...");
  setTimeout(sendUserIdToWebSite, 1000); // 1 saniye bekle
}

// Web sitesine helper fonksiyonları ekle
window.postMessage({
  type: "EXTENSION_READY",
  data: {
    hasExtension: true,
    extensionId: chrome.runtime.id
  }
}, "*");

console.log("🌐 [Content Script] Hazır");
