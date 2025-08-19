// Background Script - Guest & Permanent UUID Storage
// console.log removed

// BASİT STORAGE SİSTEMİ - Sadece 2 key
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

// Aktif UUID'yi oku (Guest veya Permanent)
async function getActiveUUID() {
  try {
    // Sadece local storage'dan oku
    const result = await chrome.storage.local.get([
      PERMANENT_UUID_KEY,
      GUEST_UUID_KEY,
      USER_LOGIN_STATUS,
    ]);

    const permanentUUID = result[PERMANENT_UUID_KEY];
    const guestUUID = result[GUEST_UUID_KEY];
    const isLoggedIn = result[USER_LOGIN_STATUS] || false;

    // Permanent UUID varsa onu kullan
    if (permanentUUID) {
      console.log("✅ [Background] Permanent UUID okundu:", permanentUUID);
      return {
        uuid: permanentUUID,
        type: "permanent",
        isLoggedIn: isLoggedIn,
      };
    }

    // Permanent UUID yoksa guest UUID'yi kullan
    if (guestUUID) {
      console.log("✅ [Background] Guest UUID okundu:", guestUUID);
      return {
        uuid: guestUUID,
        type: "guest",
        isLoggedIn: false,
      };
    }

    console.log("❌ [Background] UUID bulunamadı");
    return { uuid: null, type: "none", isLoggedIn: false };
  } catch (error) {
    console.error("❌ [Background] UUID okuma hatası:", error);
    return { uuid: null, type: "none", isLoggedIn: false };
  }
}

// Extension yüklendiğinde localStorage'ı kontrol et
async function checkLocalStorageOnInstall() {
  try {
    // Tüm açık tab'ları bul
    const tabs = await chrome.tabs.query({});
    console.log("🔍 [Background] Kontrol edilecek tab sayısı:", tabs.length);

    for (const tab of tabs) {
      try {
        // Her tab'da localStorage'ı kontrol et
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            const localPermanentUUID = localStorage.getItem(
              "tum_listem_permanent_uuid"
            );
            const localGuestUUID = localStorage.getItem(
              "tum_listem_guest_uuid"
            );

            if (localPermanentUUID || localGuestUUID) {
              console.log("🔄 [Install] localStorage'dan UUID bulundu:", {
                permanent: localPermanentUUID,
                guest: localGuestUUID,
                url: window.location.href,
              });

              // Extension'a mesaj gönder
              chrome.runtime.sendMessage({
                action: "localStorageUUIDFound",
                permanentUUID: localPermanentUUID,
                guestUUID: localGuestUUID,
                tabUrl: window.location.href,
              });
            }
          },
        });
      } catch (error) {
        // Bu tab'da script çalıştırılamaz (chrome://, chrome-extension:// gibi)
        console.log("⚠️ [Background] Tab'da script çalıştırılamadı:", tab.url);
      }
    }
  } catch (error) {
    console.error("❌ [Background] localStorage kontrol hatası:", error);
  }
}

// Guest UUID'yi oluştur veya mevcut olanı kullan
async function ensureGuestUUID() {
  try {
    const result = await getActiveUUID();

    if (!result.uuid || result.type === "none") {
      // Yeni guest UUID oluştur
      const guestUUID = generateUUID();
      await setGuestUUID(guestUUID);
      console.log("✅ [Background] Yeni Guest UUID oluşturuldu:", guestUUID);
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
    console.error("❌ [Background] ensureGuestUUID hatası:", error);
    return null;
  }
}

// Extension yüklendiğinde localStorage'ı kontrol et ve guest UUID oluştur
chrome.runtime.onInstalled.addListener(async () => {
  console.log(
    "🚀 [Background] Extension yüklendi, localStorage kontrol ediliyor..."
  );

  // Önce localStorage'ı kontrol et
  await checkLocalStorageOnInstall();

  // Sonra guest UUID'nin var olduğundan emin ol
  setTimeout(async () => {
    await ensureGuestUUID();
    console.log("✅ [Background] Extension kurulumu tamamlandı");
  }, 1000); // 1 saniye bekle ki localStorage kontrolü bitsin
});

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log removed

  if (request.action === "getActiveUUID") {
    // Aktif UUID'yi oku ve gönder
    getActiveUUID().then((result) => {
      // console.log removed
      sendResponse(result);
    });
    return true; // Async response
  }

  if (request.action === "setGuestUUID") {
    // Guest UUID'yi kaydet ve login status'u false yap
    Promise.all([
      setGuestUUID(request.uuid),
      chrome.storage.local.set({ [USER_LOGIN_STATUS]: false }),
      chrome.storage.local.remove(PERMANENT_UUID_KEY), // Permanent UUID'yi temizle
    ]).then(([success]) => {
      console.log(
        "✅ [Background] Website'den yeni Guest UUID set edildi:",
        request.uuid
      );
      sendResponse({ success: success });
    });
    return true; // Async response
  }

  if (request.action === "setPermanentUUID") {
    // Permanent UUID'yi kaydet
    setPermanentUUID(request.uuid).then((success) => {
      console.log("✅ [Background] Permanent UUID set edildi:", request.uuid);
      sendResponse({ success: success });
    });
    return true; // Async response
  }

  // Storage debug için handler
  if (request.action === "debugStorage") {
    chrome.storage.local
      .get(null)
      .then((result) => {
        console.log("🔍 [Background] Chrome Storage Local:", result);
        sendResponse({
          storage: result,
          success: true,
        });
      })
      .catch((error) => {
        sendResponse({
          error: error.message,
          success: false,
        });
      });
    return true;
  }

  // Test handler
  if (request.action === "test") {
    sendResponse({ success: true, message: "Extension çalışıyor" });
    return true;
  }

  // localStorage'dan UUID bulundu handler
  if (request.action === "localStorageUUIDFound") {
    const { permanentUUID, guestUUID } = request;

    if (permanentUUID) {
      setPermanentUUID(permanentUUID).then(() => {
        console.log(
          "✅ [Background] localStorage'dan Permanent UUID kaydedildi:",
          permanentUUID
        );
      });
    } else if (guestUUID) {
      setGuestUUID(guestUUID).then(() => {
        console.log(
          "✅ [Background] localStorage'dan Guest UUID kaydedildi:",
          guestUUID
        );
      });
    }

    sendResponse({ success: true });
    return true;
  }

  // Storage temizleme için handler
  if (request.action === "clearStorage") {
    chrome.storage.local
      .clear()
      .then(() => {
        console.log("🧹 [Background] Chrome Storage Local temizlendi");
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({
          error: error.message,
          success: false,
        });
      });
    return true;
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
        // console.log removed

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        // console.log removed
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        // console.error removed
        sendResponse({ success: false, error: error.message });
      });

    return true; // Async response
  }

  if (request.action === "ensureGuestUUID") {
    // Guest UUID'yi oluştur veya mevcut olanı kullan
    ensureGuestUUID().then((uuid) => {
      // console.log removed
      sendResponse({ uuid: uuid });
    });
    return true; // Async response
  }

  if (request.action === "clearGuestUUID") {
    // Guest UUID'yi sil
    chrome.storage.local.remove([GUEST_UUID_KEY]).then(() => {
      // console.log removed
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
      // console.log removed
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
  // console.log removed
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

// console.log removed
