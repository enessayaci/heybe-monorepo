import { onMessage, sendMessage } from "webext-bridge/background";
import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";
import { apiService } from "@/services/background.api.service";
import { type ApiResponse } from "@/services/api.types";

export default defineBackground(() => {
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

  onMessage("getStorageData", async () => {
    try {
      return await browser.storage.local.get(["token", "user"]);
    } catch (err) {
      console.log("Error on getStorageData at background:", err);
      return null;
    }
  });

  onMessage("clearStorage", async () => {
    try {
      await browser.storage.local.remove(["token", "user"]);
      return true;
    } catch (err) {
      console.log("Error on clearStorage at background:", err);
      return false;
    }
  });

  onMessage("ping", () => {
    return true;
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
