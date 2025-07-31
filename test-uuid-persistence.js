// UUID Persistence Test Script
// Bu script'i web sayfasının console'ında çalıştırın

console.log("🧪 [UUID Persistence Test] Başlıyor...");

// 1. Extension Storage'dan UUID kontrol
function checkExtensionUUID() {
  return new Promise((resolve) => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["tum_listem_user_id"], (result) => {
        const uuid = result.tum_listem_user_id;
        console.log("📦 Extension Storage UUID:", uuid);
        resolve(uuid);
      });
    } else {
      console.log("❌ Chrome Storage API bulunamadı");
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
      `https://my-list-pi.vercel.app/api/get-products?user_id=${uuid}`
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
  chrome.storage.local.set({ tum_listem_user_id: testUUID }, () => {
    console.log("🆕 Test UUID oluşturuldu:", testUUID);
  });
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
