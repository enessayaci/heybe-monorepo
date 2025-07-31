// Web Site Content Script - Web sitesi ile extension arasında köprü
console.log("🌐 [Web Site Content Script] Yüklendi");

// Web sitesine UUID bilgisini gönderen fonksiyon
function sendUUIDToWebSite(uuid) {
  console.log("📤 [Web Site] UUID web sitesine gönderiliyor:", uuid);
  
  // Global variable'a UUID'yi yaz
  window.EXTENSION_UUID = uuid;
  window.EXTENSION_UUID_TIMESTAMP = Date.now();
  
  // localStorage'a da yaz (backup)
  try {
    localStorage.setItem('EXTENSION_UUID', uuid);
    localStorage.setItem('EXTENSION_UUID_TIMESTAMP', Date.now().toString());
  } catch (e) {
    console.log("⚠️ localStorage yazılamadı:", e);
  }
  
  console.log("✅ [Web Site] UUID global variable'a yazıldı:", uuid);
  console.log("🔍 [Web Site] window.EXTENSION_UUID:", window.EXTENSION_UUID);
}

// Extension'dan UUID al
async function getUUIDFromExtension() {
  console.log("🔍 [Web Site] Extension'dan UUID alınıyor...");
  
  if (window.chrome && chrome.runtime) {
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "getUserId" },
          (response) => {
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
          }
        );
      });
      
      return response;
    } catch (error) {
      console.log("❌ [Web Site] Extension mesajlaşma hatası:", error.message);
      return null;
    }
  } else {
    console.log("❌ [Web Site] Chrome API mevcut değil");
    return null;
  }
}

// Sayfa yüklendiğinde UUID al ve web sitesine gönder
async function initializeUUID() {
  console.log("🚀 [Web Site] UUID başlatılıyor...");
  
  const uuid = await getUUIDFromExtension();
  
  if (uuid) {
    console.log("✅ [Web Site] UUID bulundu, web sitesine gönderiliyor:", uuid);
    sendUUIDToWebSite(uuid);
  } else {
    console.log("❌ [Web Site] UUID bulunamadı");
  }
}

// Sayfa yüklendiğinde çalıştır
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUUID);
} else {
  initializeUUID();
}

// Extension'dan gelen mesajları dinle
if (window.chrome && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendUUIDToWebSite") {
      console.log("📨 [Web Site] Extension'dan UUID mesajı alındı:", request.uuid);
      sendUUIDToWebSite(request.uuid);
      sendResponse({ success: true });
    }
  });
}

console.log("🌐 [Web Site Content Script] Hazır"); 