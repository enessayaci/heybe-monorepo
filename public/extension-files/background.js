// Background Script - Guest & Permanent UUID Storage
console.log("🔄 [Background] Yüklendi");

// Extension storage keys
const GUEST_UUID_KEY = "tum_listem_guest_uuid";
const PERMANENT_UUID_KEY = "tum_listem_permanent_uuid";
const USER_LOGIN_STATUS = "tum_listem_login_status";

// UUID oluştur
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Guest UUID'yi kaydet
async function setGuestUUID(uuid) {
  try {
    await chrome.storage.local.set({ [GUEST_UUID_KEY]: uuid });
    console.log("✅ [Background] Guest UUID kaydedildi:", uuid);
    return true;
  } catch (error) {
    console.error("❌ [Background] Guest UUID kaydetme hatası:", error);
    return false;
  }
}

// Permanent UUID'yi kaydet
async function setPermanentUUID(uuid) {
  try {
    // Local storage'a yaz
    await chrome.storage.local.set({ [PERMANENT_UUID_KEY]: uuid });

    // Sync storage'a da yaz (cloud sync için)
    await chrome.storage.sync.set({ [PERMANENT_UUID_KEY]: uuid });

    // Login status'u güncelle
    await chrome.storage.local.set({ [USER_LOGIN_STATUS]: true });
    await chrome.storage.sync.set({ [USER_LOGIN_STATUS]: true });

    console.log("✅ [Background] Permanent UUID kaydedildi:", uuid);
    return true;
  } catch (error) {
    console.error("❌ [Background] Permanent UUID kaydetme hatası:", error);
    return false;
  }
}

// Aktif UUID'yi oku (Guest veya Permanent)
async function getActiveUUID() {
  try {
    // Önce permanent UUID'yi kontrol et
    let result = await chrome.storage.local.get([PERMANENT_UUID_KEY]);
    let permanentUUID = result[PERMANENT_UUID_KEY];

    // Local storage'da yoksa sync storage'dan dene
    if (!permanentUUID) {
      result = await chrome.storage.sync.get([PERMANENT_UUID_KEY]);
      permanentUUID = result[PERMANENT_UUID_KEY];

      if (permanentUUID) {
        // Sync'ten bulduysa local'a da yaz
        await chrome.storage.local.set({
          [PERMANENT_UUID_KEY]: permanentUUID,
        });
        console.log(
          "🔄 [Background] Permanent UUID sync storage'dan restore edildi:",
          permanentUUID
        );
      }
    }

    // Permanent UUID varsa onu kullan
    if (permanentUUID) {
      console.log("🔍 [Background] Permanent UUID okundu:", permanentUUID);
      return { uuid: permanentUUID, type: "permanent" };
    }

    // Permanent UUID yoksa guest UUID'yi oku
    const guestResult = await chrome.storage.local.get([GUEST_UUID_KEY]);
    const guestUUID = guestResult[GUEST_UUID_KEY];

    console.log("🔍 [Background] Guest UUID okundu:", guestUUID);
    return { uuid: guestUUID, type: "guest" };
  } catch (error) {
    console.error("❌ [Background] UUID okuma hatası:", error);
    return { uuid: null, type: "none" };
  }
}

// Guest UUID'yi oluştur veya mevcut olanı kullan
async function ensureGuestUUID() {
  try {
    const result = await getActiveUUID();

    if (!result.uuid || result.type === "none") {
      const guestUUID = generateUUID();
      await setGuestUUID(guestUUID);
      console.log("👤 [Background] Yeni Guest UUID oluşturuldu:", guestUUID);
      return guestUUID;
    } else if (result.type === "guest") {
      console.log(
        "👤 [Background] Mevcut Guest UUID kullanılıyor:",
        result.uuid
      );
      return result.uuid;
    } else {
      console.log(
        "👤 [Background] Permanent UUID mevcut, Guest UUID gerekmez:",
        result.uuid
      );
      return result.uuid;
    }
  } catch (error) {
    console.error("❌ [Background] Guest UUID oluşturma hatası:", error);
    return null;
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 [Background] Mesaj alındı:", request);

  if (request.action === "getActiveUUID") {
    // Aktif UUID'yi oku ve gönder
    getActiveUUID().then((result) => {
      console.log("📤 [Background] Aktif UUID gönderiliyor:", result);
      sendResponse(result);
    });
    return true; // Async response
  }

  if (request.action === "setGuestUUID") {
    // Guest UUID'yi kaydet
    setGuestUUID(request.uuid).then((success) => {
      console.log("📤 [Background] Guest UUID kaydetme sonucu:", success);
      sendResponse({ success: success });
    });
    return true; // Async response
  }

  if (request.action === "setPermanentUUID") {
    // Permanent UUID'yi kaydet
    setPermanentUUID(request.uuid).then((success) => {
      console.log("📤 [Background] Permanent UUID kaydetme sonucu:", success);
      // Login status'u true yap
      chrome.storage.local.set({ [USER_LOGIN_STATUS]: true });
      chrome.storage.sync.set({ [USER_LOGIN_STATUS]: true });
      sendResponse({ success: success });
    });
    return true; // Async response
  }

  // API istekleri için handler
  if (request.action === "apiRequest") {
    const { method, endpoint, data } = request;

    console.log(
      `🌐 [Background] API isteği gönderiliyor: ${method} /api/${endpoint}`,
      data
    );

            fetch(`https://my-heybe.vercel.app/api/${endpoint}`, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    })
      .then((response) => {
        console.log(
          `📡 [Background] API response status:`,
          response.status,
          response.statusText
        );
        console.log(`📡 [Background] API response headers:`, response.headers);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        console.log(`✅ [Background] API ${endpoint} başarılı:`, result);
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        console.error(`❌ [Background] API ${endpoint} hatası:`, error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Async response
  }

  if (request.action === "ensureGuestUUID") {
    // Guest UUID'yi oluştur veya mevcut olanı kullan
    ensureGuestUUID().then((uuid) => {
      console.log("📤 [Background] Guest UUID hazır:", uuid);
      sendResponse({ uuid: uuid });
    });
    return true; // Async response
  }

  if (request.action === "clearGuestUUID") {
    // Guest UUID'yi sil
    chrome.storage.local.remove([GUEST_UUID_KEY]).then(() => {
      console.log("🗑️ [Background] Guest UUID silindi");
      sendResponse({ success: true });
    });
    return true; // Async response
  }

  if (request.action === "logout") {
    // Logout - Guest UUID'yi sil, login status'u false yap
    Promise.all([
      chrome.storage.local.remove([GUEST_UUID_KEY]),
      chrome.storage.local.set({ [USER_LOGIN_STATUS]: false }),
      chrome.storage.sync.set({ [USER_LOGIN_STATUS]: false }),
    ]).then(() => {
      console.log("🚪 [Background] Logout yapıldı");
      sendResponse({ success: true });
    });
    return true; // Async response
  }

  // Backward compatibility
  if (request.action === "getUserId") {
    getActiveUUID().then((result) => {
      sendResponse({ userId: result.uuid });
    });
    return true;
  }

  if (request.action === "setUserId") {
    setGuestUUID(request.userId).then((success) => {
      sendResponse({ success: success });
    });
    return true;
  }
});

// Extension yüklendiğinde Guest UUID oluştur
chrome.runtime.onInstalled.addListener(async () => {
  console.log(
    "🚀 [Background] Extension yüklendi, Guest UUID kontrol ediliyor..."
  );
  const guestUUID = await ensureGuestUUID();
  console.log("✅ [Background] Extension hazır, Guest UUID:", guestUUID);
});

// Storage değişikliklerini dinle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    // Guest UUID değişikliği
    if (changes[GUEST_UUID_KEY]) {
      const newValue = changes[GUEST_UUID_KEY].newValue;
      const oldValue = changes[GUEST_UUID_KEY].oldValue;
      console.log("🔄 [Background] Guest UUID değişti:", {
        old: oldValue,
        new: newValue,
      });

      // Tüm tab'lara bildir
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          try {
            chrome.tabs.sendMessage(tab.id, {
              action: "guestUUIDChanged",
              uuid: newValue,
            });
          } catch (error) {
            // Tab'da content script yok, hata verme
          }
        });
      });
    }

    // Permanent UUID değişikliği
    if (changes[PERMANENT_UUID_KEY]) {
      const newValue = changes[PERMANENT_UUID_KEY].newValue;
      const oldValue = changes[PERMANENT_UUID_KEY].oldValue;
      console.log("🔄 [Background] Permanent UUID değişti:", {
        old: oldValue,
        new: newValue,
      });

      // Tüm tab'lara bildir
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          try {
            chrome.tabs.sendMessage(tab.id, {
              action: "permanentUUIDChanged",
              uuid: newValue,
            });
          } catch (error) {
            // Tab'da content script yok, hata verme
          }
        });
      });
    }

    // Login status değişikliği
    if (changes[USER_LOGIN_STATUS]) {
      const newValue = changes[USER_LOGIN_STATUS].newValue;
      const oldValue = changes[USER_LOGIN_STATUS].oldValue;
      console.log("🔄 [Background] Login status değişti:", {
        old: oldValue,
        new: newValue,
      });

      // Tüm tab'lara bildir
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          try {
            chrome.tabs.sendMessage(tab.id, {
              action: "loginStatusChanged",
              isLoggedIn: newValue,
            });
          } catch (error) {
            // Tab'da content script yok, hata verme
          }
        });
      });
    }
  }
});

console.log("🔄 [Background] Hazır");
