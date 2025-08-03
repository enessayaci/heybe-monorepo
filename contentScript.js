// Content Script - Persistent UUID Bridge
console.log("🌐 [Content Script] Yüklendi");

// Aktif UUID'yi extension'dan al ve web sitesine gönder
async function sendActiveUUIDToWebSite() {
  try {
    console.log("🔍 [Content Script] Extension'dan aktif UUID alınıyor...");
    
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getActiveUUID" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("❌ [Content Script] Extension mesaj hatası:", chrome.runtime.lastError);
          reject(new Error("Extension bulunamadı"));
          return;
        }
        
        if (response && response.uuid) {
          console.log("✅ [Content Script] Extension'dan aktif UUID alındı:", response);
          resolve(response);
        } else {
          console.log("❌ [Content Script] Extension'dan UUID alınamadı");
          reject(new Error("UUID bulunamadı"));
        }
      });
    });
    
    // Web sitesine UUID'yi gönder
    sendActiveUUIDToPage(response);
    
  } catch (error) {
    console.log("❌ [Content Script] UUID alma hatası:", error.message);
  }
}

// Web sitesine aktif UUID'yi gönder
function sendActiveUUIDToPage(uuidData) {
  try {
    console.log("📤 [Content Script] Aktif UUID web sitesine gönderiliyor:", uuidData);
    
    // Web sitesine event gönder
    window.dispatchEvent(
      new CustomEvent("extensionActiveUUIDSet", {
        detail: { 
          uuid: uuidData.uuid,
          type: uuidData.type
        }
      })
    );
    
    // Global variable'a da yaz (backup)
    window.EXTENSION_ACTIVE_UUID = uuidData.uuid;
    window.EXTENSION_UUID_TYPE = uuidData.type;
    window.EXTENSION_UUID_TIMESTAMP = Date.now();
    
    console.log("✅ [Content Script] Aktif UUID web sitesine gönderildi:", uuidData);
  } catch (error) {
    console.error("❌ [Content Script] Web sitesine gönderme hatası:", error);
  }
}

// Web sitesinden gelen UUID'yi extension'a gönder
async function sendUUIDToExtension(uuid, type = 'guest') {
  try {
    console.log("📤 [Content Script] UUID extension'a gönderiliyor:", { uuid, type });
    
    const action = type === 'permanent' ? 'setPermanentUUID' : 'setGuestUUID';
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ 
        action: action, 
        uuid: uuid 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("❌ [Content Script] Extension mesaj hatası:", chrome.runtime.lastError);
          reject(new Error("Extension bulunamadı"));
          return;
        }
        
        if (response && response.success) {
          console.log("✅ [Content Script] UUID extension'a gönderildi:", { uuid, type });
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
  
  if (event.data.type === "SET_GUEST_UUID") {
    console.log("📨 [Content Script] Web sitesinden Guest UUID mesajı alındı:", event.data.uuid);
    sendUUIDToExtension(event.data.uuid, 'guest');
  }
  
  if (event.data.type === "SET_PERMANENT_UUID") {
    console.log("📨 [Content Script] Web sitesinden Permanent UUID mesajı alındı:", event.data.uuid);
    sendUUIDToExtension(event.data.uuid, 'permanent');
  }
  
  if (event.data.type === "GET_ACTIVE_UUID") {
    console.log("📨 [Content Script] Web sitesinden aktif UUID isteği alındı");
    sendActiveUUIDToWebSite();
  }
});

// Background script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "guestUUIDChanged") {
    console.log("📨 [Content Script] Background'dan Guest UUID değişikliği:", request.uuid);
    sendActiveUUIDToPage({ uuid: request.uuid, type: 'guest' });
  }
  
  if (request.action === "permanentUUIDChanged") {
    console.log("📨 [Content Script] Background'dan Permanent UUID değişikliği:", request.uuid);
    sendActiveUUIDToPage({ uuid: request.uuid, type: 'permanent' });
  }
  
  if (request.action === "loginStatusChanged") {
    console.log("📨 [Content Script] Background'dan login status değişikliği:", request.isLoggedIn);
    // Web sitesine login status değişikliğini bildir
    window.dispatchEvent(
      new CustomEvent("extensionLoginStatusChanged", {
        detail: { isLoggedIn: request.isLoggedIn }
      })
    );
  }
});

// Sayfa yüklendiğinde aktif UUID'yi gönder
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 [Content Script] Sayfa yüklendi, aktif UUID gönderiliyor...");
    setTimeout(sendActiveUUIDToWebSite, 1000); // 1 saniye bekle
  });
} else {
  console.log("🚀 [Content Script] Sayfa zaten yüklü, aktif UUID gönderiliyor...");
  setTimeout(sendActiveUUIDToWebSite, 1000); // 1 saniye bekle
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
