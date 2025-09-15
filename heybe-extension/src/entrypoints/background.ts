import { onMessage, sendMessage } from "webext-bridge/background";
import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";
import { apiService } from "@/services/background.api.service";
import { type ApiResponse } from "@/services/api.types";

export default defineBackground(() => {
  // Reusable fonksiyon: Belirtilen URL'deki tab'lere mesaj gönderir
  async function sendToWebsite(
    messageType: string,
    messageData: any,
    urlPattern: string = "http://localhost:5173/*"
  ) {
    try {
      const tabs = await browser.tabs.query({ url: urlPattern });
      console.log("Found tabs for sendToWebsite:", tabs);

      for (const tab of tabs) {
        if (tab.id) {
          console.log(`Sending message to tab ID ${tab.id}`);

          await sendMessage(
            messageType,
            messageData,
            `content-script@${tab.id}`
          );
          console.log(
            `Mesaj gönderildi: Tab ID ${tab.id}, Mesaj: ${messageType}`
          );
        }
      }
    } catch (error) {
      console.error(`${messageType} mesajı gönderilirken hata:`, error);
    }
  }

  browser.runtime.setUninstallURL("http://localhost:5173");

  // Currently not in use, content script access strage directly
  onMessage("saveStorageData", async ({ data }) => {
    try {
      const obj = JSON.parse(JSON.stringify(data));
      await browser.storage.local.set(obj);
      return true;
    } catch (err) {
      console.log("Error on saveStorageData at background:", err);
      return false;
    }
  });

  // Currently not in use, content script access storage directly
  onMessage("getStorageData", async () => {
    try {
      return await browser.storage.local.get(["token", "user"]);
    } catch (err) {
      console.log("Error on getStorageData at background:", err);
      return null;
    }
  });

  // Currently not in use, content script access and clear storage directly
  onMessage("clearStorage", async () => {
    try {
      await browser.storage.local.remove(["token", "user"]);
      return true;
    } catch (err) {
      console.log("Error on clearStorage at background:", err);
      return false;
    }
  });

  // Currently not in use, content script return true drectly
  onMessage("ping", () => {
    return true;
  });

  // HEYBE_AUTH_UPDATED mesajını dinle ve açık website tab'lerine ilet
  onMessage("HEYBE_AUTH_UPDATED", async ({ data }) => {
    console.log("Found data for HEYBE_AUTH_UPDATED:", data);
    sendToWebsite("HEYBE_AUTH_UPDATED", data as unknown as Record<string, any>);
  });

  // API istekleri için mesaj işleyicisi
  onMessage("apiCall", async ({ data, sender }): Promise<ApiResponse<any>> => {
    const { method, params } = data as {
      method: keyof typeof apiService;
      params: unknown[];
    };
    // Sekme ID'sini kontrol et
    console.log("Tabid on background apiCall: ", sender.tabId);

    if (!sender.tabId) {
      return {
        success: false,
        message: "No tab ID provided",
      };
    }

    try {
      // ApiService metodunu dinamik çağır
      const response: ApiResponse<any> = await (
        apiService[method] as (...args: any[]) => Promise<any>
      )(...(params || []));

      console.log("response background: ", response);

      return response; // Yanıt, webext-bridge tarafından otomatik olarak sender.tab.id'ye gider
    } catch (error: any) {
      console.error(
        `Error in apiCall (${method}) from tab ${sender.tabId}:`,
        error
      );
      const errorResponse = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        status: error?.status || null,
      };
      // 401 için sekme-spesifik bildirim
      if (errorResponse.status === 401) {
        await sendMessage(
          "unauthorized",
          { errorMessage: errorResponse.message },
          { context: "content-script", tabId: sender.tabId }
        );
      }
      return errorResponse; // Hata yanıtı da sadece sender.tab.id'ye gider
    }
  });
});
