// BASİT STORAGE HELPER - 16 Maddelik Akış
class SimpleStorageHelper {
  constructor() {
    this.uuidKey = "currentUuid";
    this.roleKey = "role"; // "GUEST" veya "USER"
  }

  // UUID oluştur
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Extension mevcut mu kontrol et (PostMessage ile)
  async isExtensionAvailable() {
    try {
      return await new Promise((resolve) => {
        // Timeout ekle (extension yanıt vermezse)
        const timeout = setTimeout(() => {
          console.log("🔍 [Extension Check] Timeout - extension yanıt vermedi");
          resolve(false);
        }, 2000);

        // Response listener
        const handleResponse = (event) => {
          if (event.data.action === "EXTENSION_TEST_RESPONSE") {
            clearTimeout(timeout);
            window.removeEventListener("message", handleResponse);

            if (event.data.data?.success) {
              console.log(
                "🔍 [Extension Check] Extension yanıtı alındı:",
                event.data.data
              );
              resolve(true);
            } else {
              console.log(
                "🔍 [Extension Check] Extension yanıtı geçersiz:",
                event.data.data
              );
              resolve(false);
            }
          }
        };

        // Response listener'ını ekle
        window.addEventListener("message", handleResponse);

        // Content script'e mesaj gönder
        window.postMessage(
          {
            action: "EXTENSION_TEST",
            data: {},
          },
          "*"
        );
      });
    } catch (error) {
      console.log("🔍 [Extension Check] Hata:", error);
      return false;
    }
  }

  // Extension storage'dan oku (PostMessage ile)
  async getFromExtension() {
    try {
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(null);
        }, 2000);

        const handleResponse = (event) => {
          if (event.data.action === "GET_CURRENT_UUID_RESPONSE") {
            clearTimeout(timeout);
            window.removeEventListener("message", handleResponse);

            if (event.data.data?.success) {
              resolve(event.data.data.data);
            } else {
              resolve(null);
            }
          }
        };

        window.addEventListener("message", handleResponse);

        window.postMessage(
          {
            action: "GET_CURRENT_UUID",
            data: {},
          },
          "*"
        );
      });
    } catch (error) {
      return null;
    }
  }

  // Extension storage'a yaz (PostMessage ile)
  async setToExtension(uuid, role) {
    try {
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 2000);

        const action = role === "USER" ? "SET_USER_UUID" : "CREATE_GUEST_UUID";

        const handleResponse = (event) => {
          if (event.data.action === `${action}_RESPONSE`) {
            clearTimeout(timeout);
            window.removeEventListener("message", handleResponse);

            resolve(event.data.data?.success || false);
          }
        };

        window.addEventListener("message", handleResponse);

        window.postMessage(
          {
            action,
            data: { uuid },
          },
          "*"
        );
      });
    } catch (error) {
      return false;
    }
  }

  // Extension storage'ı temizle (PostMessage ile)
  async clearExtension() {
    try {
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 2000);

        const handleResponse = (event) => {
          if (event.data.action === "CLEAR_STORAGE_RESPONSE") {
            clearTimeout(timeout);
            window.removeEventListener("message", handleResponse);

            resolve(event.data.data?.success || false);
          }
        };

        window.addEventListener("message", handleResponse);

        window.postMessage(
          {
            action: "CLEAR_STORAGE",
            data: {},
          },
          "*"
        );
      });
    } catch (error) {
      return false;
    }
  }

  // DEBUG: Tüm durumları kontrol et
  async debugStatus() {
    console.log("🔍 [DEBUG] Storage durumu kontrol ediliyor...");

    // 1. Extension durumu
    const hasExtension = await this.isExtensionAvailable();
    console.log("🔍 [DEBUG] Extension mevcut:", hasExtension);

    // 2. Extension storage
    if (hasExtension) {
      const extensionData = await this.getFromExtension();
      console.log("🔍 [DEBUG] Extension storage:", extensionData);
    }

    // 3. LocalStorage
    const localData = this.getFromLocal();
    console.log("🔍 [DEBUG] LocalStorage:", localData);

    // 4. getCurrentUUID sonucu
    const currentData = await this.getCurrentUUID();
    console.log("🔍 [DEBUG] getCurrentUUID sonucu:", currentData);

    return {
      hasExtension,
      extensionData: hasExtension ? await this.getFromExtension() : null,
      localData,
      currentData,
    };
  }

  // LocalStorage'dan oku
  getFromLocal() {
    try {
      const uuid = localStorage.getItem(this.uuidKey);
      const role = localStorage.getItem(this.roleKey) || "GUEST";
      return uuid ? { uuid, role } : null;
    } catch (error) {
      return null;
    }
  }

  // LocalStorage'a yaz
  setToLocal(uuid, role = "GUEST") {
    try {
      localStorage.setItem(this.uuidKey, uuid);
      localStorage.setItem(this.roleKey, role);
      console.log(
        `✅ [Website] LocalStorage güncellendi: ${uuid}, Role: ${role}`
      );
      return true;
    } catch (error) {
      console.log("❌ [Website] LocalStorage yazma hatası:", error);
      return false;
    }
  }

  // LocalStorage'ı temizle
  clearLocal() {
    try {
      localStorage.removeItem(this.uuidKey);
      localStorage.removeItem(this.roleKey);
      console.log("✅ [Website] LocalStorage temizlendi");
      return true;
    } catch (error) {
      console.log("❌ [Website] LocalStorage temizleme hatası:", error);
      return false;
    }
  }

  // ANA FONKSİYON: Aktif UUID'yi al (Madde 3, 12, 13)
  async getCurrentUUID() {
    console.log("🔍 [Website] UUID alma başladı");

    // 1. Extension var mı kontrol et
    const hasExtension = await this.isExtensionAvailable();
    console.log("🔍 [Website] Extension durumu:", hasExtension);

    if (hasExtension) {
      // Extension varsa ondan oku (Madde 3)
      const extensionData = await this.getFromExtension();
      if (extensionData?.uuid) {
        console.log("✅ [Website] Extension'dan UUID alındı:", extensionData);
        // LocalStorage'ı extension ile sync et (Madde 3)
        this.setToLocal(extensionData.uuid, extensionData.role);
        return extensionData;
      }
    }

    // 2. Extension yoksa veya boşsa localStorage'dan oku (Madde 12, 13)
    const localData = this.getFromLocal();
    if (localData?.uuid) {
      console.log("✅ [Website] LocalStorage'dan UUID alındı:", localData);
      return localData;
    }

    console.log("❌ [Website] UUID bulunamadı");
    return null;
  }

  // Kayıt/Giriş sonrası UUID kaydet (Madde 4, 9, 10, 11)
  async setUserUUID(uuid) {
    console.log("💾 [Website] User UUID kaydediliyor:", uuid);

    // 1. LocalStorage'a kaydet
    this.setToLocal(uuid, "USER");

    // 2. Extension varsa ona da kaydet
    const hasExtension = await this.isExtensionAvailable();
    if (hasExtension) {
      await this.setToExtension(uuid, "USER");
      console.log("✅ [Website] Extension'a da USER UUID kaydedildi");
    }

    return true;
  }

  // Çıkış yap (Madde 7, 14, 15, 16)
  async logout() {
    console.log("🚪 [Website] Çıkış yapılıyor");

    // 1. Extension var mı kontrol et
    const hasExtension = await this.isExtensionAvailable();

    // 2. Her ikisini de temizle
    this.clearLocal();
    if (hasExtension) {
      await this.clearExtension();
    }

    // 3. Extension varsa yeni misafir UUID oluştur (Madde 7, 14, 16)
    if (hasExtension) {
      const guestUuid = this.generateUUID();
      await this.setToExtension(guestUuid, "GUEST");
      this.setToLocal(guestUuid, "GUEST");
      console.log(
        "✅ [Website] Çıkış sonrası misafir UUID oluşturuldu:",
        guestUuid
      );
      return { uuid: guestUuid, role: "GUEST" };
    }

    console.log("✅ [Website] Çıkış tamamlandı (extension yok)");
    return null;
  }

  // Misafir ürünleri transfer et (Madde 9, 10)
  async transferGuestProducts(oldUuid, newUuid) {
    console.log(`🔄 [Website] Ürün transferi: ${oldUuid} → ${newUuid}`);

    // Transfer artık API'de otomatik yapılıyor (login/register sırasında)
    // Bu fonksiyon sadece log için kullanılıyor
    console.log("✅ [Website] Transfer API'de otomatik yapıldı");
    return true;
  }
}

export default SimpleStorageHelper;
