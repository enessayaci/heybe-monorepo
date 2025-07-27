chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Background: Mesaj alındı:", request);

  if (request.type === "getMyList") {
    console.log("🔍 Background: getMyList isteği alındı");
    chrome.storage.local.get(["myList"], (result) => {
      console.log("📦 Background: Chrome Storage'dan veri alındı:", result);
      const myList = result.myList || [];
      console.log("📋 Background: Gönderilecek liste:", myList);
      sendResponse({ myList: myList });
    });
    return true; // Indicates async response
  }

  // Storage'ı konsola yazdırma komutu
  if (request.type === "logStorage") {
    console.log("🔧 Background: logStorage isteği alındı");
    chrome.storage.local.get(null, (result) => {
      console.log("📦 Background: Tüm Chrome Storage:", result);
    });
    sendResponse({ success: true });
  }

  // Test mesajı
  if (request.type === "test") {
    console.log("🧪 Background: Test mesajı alındı");
    sendResponse({
      success: true,
      message: "Background script çalışıyor!",
      timestamp: new Date().toISOString(),
    });
  }
});

// Extension yüklendiğinde storage'ı konsola yazdır
chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension yüklendi! Chrome Storage kontrol ediliyor...");
  chrome.storage.local.get(null, (result) => {
    console.log("📦 Background: İlk yükleme - Tüm Chrome Storage:", result);
  });
});

// Extension başlatıldığında
console.log("🚀 Background script başlatıldı!");
