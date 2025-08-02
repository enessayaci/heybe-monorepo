// IndexedDB Helper - Cross-Origin Shared Storage
// Tüm domain'ler bu database'e erişebilir

class ExtensionSharedDB {
  constructor() {
    this.dbName = "ExtensionSharedStorage";
    this.dbVersion = 1;
    this.storeName = "extension_data";
    this.db = null;
  }

  // Database'i aç
  async openDB() {
    return new Promise((resolve, reject) => {
      console.log("🗄️ [IndexedDB] Database açılıyor...");

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("❌ [IndexedDB] Database açılırken hata:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("✅ [IndexedDB] Database başarıyla açıldı");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log("🔧 [IndexedDB] Database upgrade ediliyor...");
        const db = event.target.result;

        // Object store oluştur
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "key",
          });
          console.log(
            "📦 [IndexedDB] Object store oluşturuldu:",
            this.storeName
          );
        }
      };
    });
  }

  // UUID'yi yaz
  async setUUID(uuid) {
    try {
      if (!this.db) {
        console.log("🔧 [IndexedDB] Database açılıyor (setUUID)...");
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        console.log("💾 [IndexedDB] UUID yazılıyor:", uuid);
        console.log("🔧 [IndexedDB] Database durumu (setUUID):", this.db ? "Açık" : "Kapalı");

        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);

        const data = {
          key: "extension_uuid",
          value: uuid,
          timestamp: Date.now(),
        };

        console.log("💾 [IndexedDB] Yazılacak data:", data);

        const request = store.put(data);

        request.onsuccess = () => {
          console.log("✅ [IndexedDB] UUID başarıyla yazıldı:", uuid);
          // Global notification gönder
          window.dispatchEvent(
            new CustomEvent("indexedDBUUIDWritten", {
              detail: { uuid: uuid },
            })
          );
          resolve(true);
        };

        request.onerror = () => {
          console.error("❌ [IndexedDB] UUID yazılırken hata:", request.error);
          console.error("❌ [IndexedDB] Error details:", request.error?.message);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("❌ [IndexedDB] UUID yazma hatası:", error);
      console.error("❌ [IndexedDB] Error stack:", error.stack);
      return false;
    }
  }

  // UUID'yi oku
  async getUUID() {
    try {
      if (!this.db) {
        console.log("🔧 [IndexedDB] Database açılıyor...");
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        console.log("🔍 [IndexedDB] UUID okunuyor...");
        console.log("🔧 [IndexedDB] Database durumu:", this.db ? "Açık" : "Kapalı");
        console.log("🔧 [IndexedDB] Store name:", this.storeName);

        const transaction = this.db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get("extension_uuid");

        request.onsuccess = () => {
          const result = request.result;
          console.log("🔍 [IndexedDB] Raw result:", result);
          
          if (result) {
            // 5 dakikadan eski değilse kullan
            const age = Date.now() - result.timestamp;
            console.log("🔍 [IndexedDB] UUID age:", age, "ms");
            
            if (age < 5 * 60 * 1000) {
              // 5 dakika
              console.log(
                "✅ [IndexedDB] UUID başarıyla okundu:",
                result.value
              );
              resolve(result.value);
            } else {
              console.log("⚠️ [IndexedDB] UUID eski, temizleniyor");
              this.deleteUUID();
              resolve(null);
            }
          } else {
            console.log("❌ [IndexedDB] UUID bulunamadı - result null");
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error("❌ [IndexedDB] UUID okuma hatası:", request.error);
          console.error("❌ [IndexedDB] Error details:", request.error?.message);
          resolve(null);
        };
      });
    } catch (error) {
      console.error("❌ [IndexedDB] UUID okuma hatası:", error);
      console.error("❌ [IndexedDB] Error stack:", error.stack);
      return null;
    }
  }

  // UUID'yi sil
  async deleteUUID() {
    try {
      if (!this.db) await this.openDB();

      return new Promise((resolve) => {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.delete("extension_uuid");

        request.onsuccess = () => {
          console.log("🗑️ [IndexedDB] UUID silindi");
          resolve(true);
        };

        request.onerror = () => {
          console.error("❌ [IndexedDB] UUID silinirken hata:", request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error("❌ [IndexedDB] UUID silme hatası:", error);
      return false;
    }
  }

  // Database'i kapat
  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("🔒 [IndexedDB] Database kapatıldı");
    }
  }

  // Debug: Tüm verileri listele
  async debugListAll() {
    try {
      if (!this.db) await this.openDB();
      
      return new Promise((resolve) => {
        const transaction = this.db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log("🔍 [IndexedDB Debug] Tüm veriler:", request.result);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error("❌ [IndexedDB Debug] Hata:", request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.error("❌ [IndexedDB Debug] Hata:", error);
      return [];
    }
  }
}

// Global instance oluştur
window.ExtensionSharedDB = new ExtensionSharedDB();

// Hemen event'i gönder (database açılmasını beklemeden)
console.log("🗄️ [IndexedDB Helper] Yüklendi - READY event gönderiliyor");
window.dispatchEvent(new Event("ExtensionSharedDBReady"));

// Database'i arka planda aç
window.ExtensionSharedDB.openDB()
  .then(() => {
    console.log("🗄️ [IndexedDB Helper] Database başarıyla açıldı");
  })
  .catch((error) => {
    console.error("❌ [IndexedDB Helper] Database açılamadı:", error);
  });
