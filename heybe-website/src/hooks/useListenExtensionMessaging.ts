import { useCallback, useEffect, useRef } from "react";
import { useMainStoreBase } from "@/store/main";
import {
  getFromExtension,
  type StorageData,
} from "@/services/extensionService";
import { messenger } from "@/services/messenger";

export const useListenExtensionMessaging = () => {
  const setUser = useMainStoreBase((state) => state.setUser);
  const setToken = useMainStoreBase((state) => state.setToken);
  const setExtensionAvailable = useMainStoreBase(
    (state) => state.setExtensionAvailable
  );
  const isExtensionAvailable = useMainStoreBase(
    (state) => state.isExtensionAvailable
  );
  const cleanupRef = useRef<() => void>(() => {});

  const initializeStorage = useCallback(async () => {
    const extensionData = await getFromExtension();
    if (extensionData?.token || extensionData?.user) {
      console.log("📱 Extension data found, syncing to localStorage");
      setToken(extensionData.token);
      setUser(extensionData.user);
    }
  }, []);

  useEffect(() => {
    console.log("📡 [Extension] Checking for extension availability...");

    // Ping fonksiyonu: 1 saniye timeout ile mesaj gönderir
    const pingExtension = () => {
      return Promise.race([
        messenger.sendMessage("ping"),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Ping timeout after 1 second")),
            1000
          )
        ),
      ]);
    };

    // Uzantı kontrolünü yapan fonksiyon
    const checkExtensionAvailability = async () => {
      let attempts = 0;
      const maxAttempts = 10;
      let intervalId: NodeJS.Timeout | null = null;

      const tryPing = async (): Promise<boolean> => {
        // Eğer zaten yüklendiyse ping atmayı bırak
        if (isExtensionAvailable) {
          console.log("📡 [Extension] Already loaded, skipping ping");
          return true;
        }
        try {
          const response = await pingExtension();
          if (response) {
            console.log(
              "📡 [Extension] Extension is already available (ping response)"
            );
            setExtensionAvailable(true);
            initializeStorage();
            return true; // Başarılı, denemeyi durdur
          }
        } catch (error) {
          console.warn(
            `⚠️ [Extension] Error sending ping (attempt ${attempts + 1}):`,
            error
          );
        }
        return false; // Başarısız, devam et
      };

      // İlk deneme
      const success = await tryPing();
      if (success) return () => {};

      // 100ms aralıklarla 10 ek deneme
      intervalId = setInterval(async () => {
        attempts += 1;
        const success = await tryPing();

        if (success || attempts >= maxAttempts) {
          clearInterval(intervalId!);
          if (!success) {
            console.log(
              "📡 [Extension] No response after 10 attempts, extension not available"
            );
            setExtensionAvailable(false);
          }
        }
      }, 100); // Her 100ms'de bir dene

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    };

    const unsubscribeAuthUpdated = messenger.onMessage(
      "HEYBE_AUTH_UPDATED",
      ({ data }) => {
        console.log("🔐 [Website] Auth updated event received:", data);
        if (data) {
          const { user, token } = JSON.parse(data) as StorageData;
          setUser(user);
          setToken(token);
        }
      }
    );

    // Uzantı kontrolünü başlat ve cleanup fonksiyonunu sakla
    checkExtensionAvailability().then((cleanup) => {
      cleanupRef.current = cleanup;
    });

    // Temizleme: Abonelikleri ve interval'i kaldır
    return () => {
      cleanupRef.current();
      unsubscribeAuthUpdated();
    };
  }, [
    setExtensionAvailable,
    initializeStorage,
    setUser,
    setToken,
    isExtensionAvailable,
  ]);

  return null;
};
