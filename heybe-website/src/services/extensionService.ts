import { messenger } from "./messenger";

export interface User {
  email: string;
  is_guest: boolean;
}

export interface StorageData {
  token: string | null;
  user: User | null;
}

export interface ExtensionMessage {
  action: string;
  data?: unknown;
  timestamp?: number;
}

export interface ExtensionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Uzantının kullanılabilir olup olmadığını kontrol et
 */
export const isExtensionAvailable = async (
  timeoutMs: number = 2000
): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    );
    await Promise.race([messenger.sendMessage("ping"), timeoutPromise]);
    return true;
  } catch (error) {
    console.warn("⚠️ [Storage] Extension availability check failed:", error);
    return false;
  }
};

/**
 * Uzantıya mesaj gönder
 */
export const sendMessageToExtension = async (
  message: ExtensionMessage
): Promise<ExtensionResponse> => {
  const { action, data } = message;
  try {
    switch (action) {
      case "GET_STORAGE_DATA": {
        const storageData = await messenger.sendMessage("getStorageData");
        return { success: true, data: storageData };
      }
      case "SAVE_STORAGE_DATA": {
        const saveSuccess = await messenger.sendMessage(
          "saveStorageData",
          data as StorageData
        );
        return { success: saveSuccess };
      }
      case "CLEAR_STORAGE": {
        const clearSuccess = await messenger.sendMessage("clearStorage");
        return { success: clearSuccess };
      }
      default:
        return { success: false, error: "Unknown action" };
    }
  } catch (error) {
    console.warn("⚠️ [Storage] Failed to send message:", error);
    return {
      success: false,
      error: (error as Error).message || "Extension error",
    };
  }
};

/**
 * Uzantıdan veri al
 */
export const getFromExtension = async (): Promise<StorageData | null> => {
  try {
    if (!(await isExtensionAvailable())) {
      throw new Error("Extension not available");
    }
    const response = await sendMessageToExtension({
      action: "GET_STORAGE_DATA",
      timestamp: Date.now(),
    });
    if (response.success) {
      return response.data as StorageData;
    }
  } catch (error) {
    console.warn("⚠️ [Storage] Failed to get data from extension:", error);
  }
  return null;
};

/**
 * Uzantıya veri kaydet
 */
export const saveToExtension = async (data: StorageData): Promise<boolean> => {
  try {
    if (!(await isExtensionAvailable())) {
      throw new Error("ℹ️ [Storage] Extension not available");
    }
    console.log("🔄 [Storage] Saving data to extension...", data);
    const response = await sendMessageToExtension({
      action: "SAVE_STORAGE_DATA",
      data,
    });
    if (response.success) {
      console.log("✅ [Storage] Data saved to extension successfully");
      return true;
    } else {
      console.warn("⚠️ [Storage] Extension save failed:", response.error);
    }
  } catch (error) {
    console.warn("⚠️ [Storage] Extension save error:", error);
  }
  return false;
};

export const clearExtensionStorage = async (): Promise<boolean> => {
  try {
    if (!(await isExtensionAvailable())) {
      throw new Error("ℹ️ [Storage] Extension not available");
    }
    console.log("🔄 [Storage] clearing extension storage...");
    const response = await sendMessageToExtension({
      action: "CLEAR_STORAGE",
    });
    if (response.success) {
      console.log("✅ [Storage] Data cleared at extension successfully");
      return true;
    } else {
      console.warn("⚠️ [Storage] Extension clearing failed:", response.error);
    }
  } catch (error) {
    console.warn("⚠️ [Storage] Extension clearing error:", error);
  }
  return false;
};
