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

    // Ping fonksiyonu: Zaman aşımı ile mesaj gönderir
    const pingExtension = () => {
      return Promise.race([
        messenger.sendMessage("ping"),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Ping timeout after 2 seconds")),
            2000
          )
        ),
      ]);
    };

    // Uzantı kontrolünü yapan fonksiyon
    const checkExtensionAvailability = async () => {
      let attempts = 0;
      const maxAttempts = 5;
      let intervalId: NodeJS.Timeout | null = null;

      const tryPing = async (): Promise<boolean> => {
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
      if (success) return () => {}; // Başarılıysa boş temizleme fonksiyonu

      // Periyodik deneme
      intervalId = setInterval(async () => {
        attempts += 1;
        const success = await tryPing();

        if (success || attempts >= maxAttempts) {
          clearInterval(intervalId!);
          if (!success) {
            console.log(
              "📡 [Extension] No response after 5 attempts, extension not available"
            );
            setExtensionAvailable(false);
          }
        }
      }, 1000); // Her 1 saniyede bir dene

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    };

    const unsubscribeLoaded = messenger.onMessage(
      "HEYBE_EXTENSION_LOADED",
      async () => {
        console.log("📡 [Extension] Extension loaded event received");
        setExtensionAvailable(true);
        initializeStorage();
        unsubscribeLoaded(); // Dinleyiciyi hemen kaldır
        return true;
      }
    );

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
      unsubscribeLoaded();
      unsubscribeAuthUpdated();
    };
  }, [setExtensionAvailable, initializeStorage, setUser, setToken]);

  return null;
};
