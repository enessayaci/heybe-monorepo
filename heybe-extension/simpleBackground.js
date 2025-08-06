// BASİT BACKGROUND SCRIPT - 16 Maddelik Akış
// Storage Keys
const UUID_KEY = "currentUuid";
const ROLE_KEY = "role"; // "GUEST" veya "USER"

// UUID oluştur
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// UUID kaydet (GUEST veya USER)
async function setCurrentUUID(uuid, role = "GUEST") {
  try {
    await chrome.storage.local.set({
      [UUID_KEY]: uuid,
      [ROLE_KEY]: role,
    });
    console.log(`✅ [Background] UUID kaydedildi: ${uuid}, Role: ${role}`);
    return true;
  } catch (error) {
    console.log("❌ [Background] UUID kaydetme hatası:", error);
    return false;
  }
}

// Aktif UUID'yi oku
async function getCurrentUUID() {
  try {
    const result = await chrome.storage.local.get([UUID_KEY, ROLE_KEY]);
    if (result[UUID_KEY]) {
      console.log(
        `✅ [Background] UUID okundu: ${result[UUID_KEY]}, Role: ${
          result[ROLE_KEY] || "GUEST"
        }`
      );
      return {
        uuid: result[UUID_KEY],
        role: result[ROLE_KEY] || "GUEST",
      };
    }
    console.log("❌ [Background] UUID bulunamadı");
    return null;
  } catch (error) {
    console.log("❌ [Background] UUID okuma hatası:", error);
    return null;
  }
}

// Misafir UUID oluştur ve kaydet
async function createGuestUUID() {
  const guestUuid = generateUUID();
  const success = await setCurrentUUID(guestUuid, "GUEST");
  return success ? guestUuid : null;
}

// Storage'ı temizle
async function clearStorage() {
  try {
    await chrome.storage.local.remove([UUID_KEY, ROLE_KEY]);
    console.log("✅ [Background] Storage temizlendi");
    return true;
  } catch (error) {
    console.log("❌ [Background] Storage temizleme hatası:", error);
    return false;
  }
}

// Extension yüklendiğinde misafir UUID oluştur (Madde 2)
chrome.runtime.onInstalled.addListener(async () => {
  console.log("🚀 [Background] Extension yüklendi");
  await initializeUUID();
});

// Extension başladığında UUID kontrolü (Madde 2)
chrome.runtime.onStartup.addListener(async () => {
  console.log("🚀 [Background] Extension başlatıldı");
  await initializeUUID();
});

// UUID initialize fonksiyonu
async function initializeUUID() {
  // Mevcut UUID var mı kontrol et
  const existing = await getCurrentUUID();
  if (!existing) {
    // Yoksa misafir UUID oluştur
    const guestUuid = await createGuestUUID();
    console.log("🆕 [Background] Misafir UUID oluşturuldu:", guestUuid);
  } else {
    console.log("✅ [Background] Mevcut UUID:", existing);
  }
}

// Mesaj handler'ları
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 [Background] Mesaj alındı:", request.action);

  // UUID al
  if (request.action === "getCurrentUUID") {
    getCurrentUUID().then((data) => {
      sendResponse({ success: true, data });
    });
    return true; // Async response
  }

  // UUID kaydet (Giriş/Kayıt sonrası - Madde 4, 9, 10, 11)
  if (request.action === "setUserUUID") {
    setCurrentUUID(request.uuid, "USER").then((success) => {
      sendResponse({ success });
    });
    return true; // Async response
  }

  // Misafir UUID oluştur (Çıkış sonrası - Madde 7, 14)
  if (request.action === "createGuestUUID") {
    createGuestUUID().then((uuid) => {
      sendResponse({ success: !!uuid, uuid });
    });
    return true; // Async response
  }

  // Storage temizle (Çıkış - Madde 7, 14, 15)
  if (request.action === "clearStorage") {
    clearStorage().then((success) => {
      sendResponse({ success });
    });
    return true; // Async response
  }

  // API Request (CORS bypass için)
  if (request.action === "apiRequest") {
    const { method, endpoint, data } = request;
    const url = `https://my-heybe.vercel.app/api/${endpoint}`;

    console.log(`🌐 [Background] API Request: ${method} ${url}`, data);

    const fetchOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      fetchOptions.body = JSON.stringify(data);
    }

    fetch(url, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        console.log(`✅ [Background] API Success:`, result);
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        console.error(`❌ [Background] API Error:`, error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Async response
  }

  // Test mesajı (Extension detection için)
  if (request.action === "test") {
    sendResponse({ success: true, message: "Extension aktif" });
    return true;
  }
});

console.log("🚀 [Background] Basit background script yüklendi");
