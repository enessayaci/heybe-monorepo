// Background Script - Persistent UUID Storage
console.log("🔄 [Background] Yüklendi");

// Extension storage key - Persistent storage kullan
const STORAGE_KEY = "tum_listem_user_id";

// UUID oluştur
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// UUID'yi kaydet - Persistent storage kullan
async function setUserId(userId) {
  try {
    // Local storage'a yaz (extension silinse bile kalır)
    await chrome.storage.local.set({ [STORAGE_KEY]: userId });
    
    // Sync storage'a da yaz (cloud sync için)
    await chrome.storage.sync.set({ [STORAGE_KEY]: userId });
    
    console.log("✅ [Background] UUID persistent storage'a kaydedildi:", userId);
    return true;
  } catch (error) {
    console.error("❌ [Background] UUID kaydetme hatası:", error);
    return false;
  }
}

// UUID'yi oku - Persistent storage'dan
async function getUserId() {
  try {
    // Önce local storage'dan dene
    let result = await chrome.storage.local.get([STORAGE_KEY]);
    let userId = result[STORAGE_KEY];
    
    // Local storage'da yoksa sync storage'dan dene
    if (!userId) {
      result = await chrome.storage.sync.get([STORAGE_KEY]);
      userId = result[STORAGE_KEY];
      
      if (userId) {
        // Sync'ten bulduysa local'a da yaz
        await chrome.storage.local.set({ [STORAGE_KEY]: userId });
        console.log("🔄 [Background] UUID sync storage'dan restore edildi:", userId);
      }
    }
    
    console.log("🔍 [Background] UUID okundu:", userId);
    return userId;
  } catch (error) {
    console.error("❌ [Background] UUID okuma hatası:", error);
    return null;
  }
}

// UUID'yi oluştur veya mevcut olanı kullan
async function ensureUserId() {
  try {
    let userId = await getUserId();
    
    if (!userId) {
      userId = generateUUID();
      await setUserId(userId);
      console.log("👤 [Background] Yeni UUID oluşturuldu:", userId);
    } else {
      console.log("👤 [Background] Mevcut UUID kullanılıyor:", userId);
    }
    
    return userId;
  } catch (error) {
    console.error("❌ [Background] UUID oluşturma hatası:", error);
    return null;
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 [Background] Mesaj alındı:", request);
  
  if (request.action === "getUserId") {
    // UUID'yi oku ve gönder
    getUserId().then(userId => {
      console.log("📤 [Background] UUID gönderiliyor:", userId);
      sendResponse({ userId: userId });
    });
    return true; // Async response
  }
  
  if (request.action === "setUserId") {
    // UUID'yi kaydet
    setUserId(request.userId).then(success => {
      console.log("📤 [Background] UUID kaydetme sonucu:", success);
      sendResponse({ success: success });
    });
    return true; // Async response
  }
  
  if (request.action === "ensureUserId") {
    // UUID'yi oluştur veya mevcut olanı kullan
    ensureUserId().then(userId => {
      console.log("📤 [Background] UUID hazır:", userId);
      sendResponse({ userId: userId });
    });
    return true; // Async response
  }
  
  if (request.action === "clearUserId") {
    // UUID'yi sil - Her iki storage'dan da sil
    Promise.all([
      chrome.storage.local.remove([STORAGE_KEY]),
      chrome.storage.sync.remove([STORAGE_KEY])
    ]).then(() => {
      console.log("🗑️ [Background] UUID her iki storage'dan da silindi");
      sendResponse({ success: true });
    });
    return true; // Async response
  }
});

// Extension yüklendiğinde UUID oluştur
chrome.runtime.onInstalled.addListener(async () => {
  console.log("🚀 [Background] Extension yüklendi, UUID kontrol ediliyor...");
  const userId = await ensureUserId();
  console.log("✅ [Background] Extension hazır, UUID:", userId);
});

// Storage değişikliklerini dinle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes[STORAGE_KEY]) {
    const newValue = changes[STORAGE_KEY].newValue;
    const oldValue = changes[STORAGE_KEY].oldValue;
    console.log("🔄 [Background] UUID değişti:", { old: oldValue, new: newValue });
    
    // Tüm tab'lara bildir
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        try {
          chrome.tabs.sendMessage(tab.id, {
            action: "userIdChanged",
            userId: newValue
          });
        } catch (error) {
          // Tab'da content script yok, hata verme
        }
      });
    });
  }
});

console.log("🔄 [Background] Hazır");
