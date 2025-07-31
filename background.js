// Extension icon'a tıklandığında web sayfasını aç
chrome.action.onClicked.addListener((tab) => {
  console.log("🖱️ [Tüm Listem] Extension icon'a tıklandı");

  // Web sayfasını yeni sekmede aç
  chrome.tabs.create({
    url: "https://my-list-pi.vercel.app/",
  });
});

// Extension yüklendiğinde
chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 [Tüm Listem] Extension yüklendi!");
  console.log(
    "📝 [Tüm Listem] Extension icon'a tıklayarak web sayfasını açabilirsiniz"
  );
});

// Background script başlatıldığında
console.log("🚀 [Tüm Listem] Background script başlatıldı!");
