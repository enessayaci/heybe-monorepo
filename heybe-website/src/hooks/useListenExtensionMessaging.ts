import { useCallback, useEffect } from "react";
import { useMainStoreBase } from "@/store/main";
import { getFromExtension, StorageData } from "@/services/extensionService";
import { messenger } from "@/services/messenger";

export const useListenExtensionMessaging = () => {
  const setUser = useMainStoreBase((state) => state.setUser);
  const setToken = useMainStoreBase((state) => state.setToken);
  const setExtensionAvailable = useMainStoreBase(
    (state) => state.setExtensionAvailable
  );

  const initializeStorage = useCallback(async () => {
    console.log("🚀  Initializing storage...");
    const extensionData = await getFromExtension();
    if (extensionData?.token || extensionData?.user) {
      console.log("📱 Extension data found, syncing to localStorage");
      setToken(extensionData.token);
      setUser(extensionData.user);
    }
  }, []);

  useEffect(() => {
    // HEYBE_EXTENSION_LOADED mesajını dinle
    const unsubscribeLoaded = messenger.onMessage(
      "HEYBE_EXTENSION_LOADED",
      async () => {
        console.log("📡 [Extension] Extension loaded event received");
        setExtensionAvailable(true);
        initializeStorage();
        return true;
      }
    );

    // HEYBE_AUTH_UPDATED mesajını dinle
    const unsubscribeAuthUpdated = messenger.onMessage(
      "HEYBE_AUTH_UPDATED",
      (message) => {
        console.log("🔐 [Extension] Auth updated event received:", message);
        if (message?.data) {
          const { user, token } = message.data as StorageData;
          setUser(user);
          setToken(token);
        }
      }
    );

    // Temizlik: Abonelikleri kaldır
    return () => {
      unsubscribeLoaded();
      unsubscribeAuthUpdated();
    };
  }, []);

  return null;
};
