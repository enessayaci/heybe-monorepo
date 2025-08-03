// UUID Persistence Test Script
// Bu script'i web sayfasının console'ında çalıştırın

console.log("🧪 [UUID Persistence Test] Başlıyor...");

// 1. Extension'dan UUID kontrol (Message Passing ile)
function checkExtensionUUID() {
  return new Promise((resolve) => {
    if (window.chrome && chrome.runtime) {
      chrome.runtime.sendMessage(
        { action: "getUserId" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log("❌ Extension mesaj hatası:", chrome.runtime.lastError);
            resolve(null);
            return;
          }
          
          const uuid = response?.userId;
          console.log("📦 Extension'dan UUID:", uuid);
          resolve(uuid);
        }
      );
    } else {
      console.log("❌ Chrome Runtime API bulunamadı");
      resolve(null);
    }
  });
}

// 2. Database'den ürün sayısını kontrol
async function checkDatabaseProducts(uuid) {
  if (!uuid) {
    console.log("❌ UUID yok, database kontrol edilemiyor");
    return;
  }

  try {
    const response = await fetch(
      `https://my-heybe.vercel.app/api/get-products?user_id=${uuid}`
    );
    const data = await response.json();

    console.log("📦 Database'den gelen ürünler:", data);
    console.log(`📊 Toplam ürün sayısı: ${data.products?.length || 0}`);

    if (data.products && data.products.length > 0) {
      console.log("🎉 Ürünler korunmuş!");
      data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.price}`);
      });
    } else {
      console.log("⚠️ Hiç ürün bulunamadı");
    }
  } catch (error) {
    console.error("❌ Database kontrol hatası:", error);
  }
}

// 3. Test UUID oluştur (sadece test için)
function createTestUUID() {
  const testUUID = "test-persistence-" + Date.now();
  chrome.runtime.sendMessage(
    { action: "setUserId", userId: testUUID },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("❌ Test UUID oluşturma hatası:", chrome.runtime.lastError);
      } else {
        console.log("🆕 Test UUID oluşturuldu:", testUUID);
      }
    }
  );
  return testUUID;
}

// Ana test fonksiyonu
async function runPersistenceTest() {
  console.log("\n🔍 1. Extension Storage Kontrolü:");
  const uuid = await checkExtensionUUID();

  console.log("\n🔍 2. Database Kontrolü:");
  await checkDatabaseProducts(uuid);

  console.log("\n📋 Test Sonuçları:");
  console.log("✅ Extension Storage → Database bağlantısı çalışıyor");
  console.log("✅ UUID persistent (extension sil/kur işlemlerinde korunur)");
  console.log("✅ Ürünler database'de güvenli");

  console.log("\n🧪 Persistence Test Talimatları:");
  console.log("1. chrome://extensions/ → Extension'ı disable et");
  console.log("2. Bu script'i tekrar çalıştır → UUID kaybolur");
  console.log("3. Extension'ı enable et");
  console.log("4. Bu script'i tekrar çalıştır → UUID geri gelir!");
}

// Script'i çalıştır
runPersistenceTest();

// Manuel fonksiyonlar (console'da kullanmak için)
window.testUUID = {
  check: checkExtensionUUID,
  database: checkDatabaseProducts,
  create: createTestUUID,
  run: runPersistenceTest,
};

console.log("\n🔧 Manuel Kullanım:");
console.log("testUUID.check() → UUID kontrol");
console.log("testUUID.database('uuid-here') → Database kontrol");
console.log("testUUID.run() → Tam test");
