import {
  allowWindowMessaging,
  sendMessage,
} from "webext-bridge/content-script";
import { defineCustomEventMessaging } from "@webext-core/messaging/page";
import { StorageData } from "./storage.service";
import { storage } from "wxt/storage";

export interface ProtocolMap {
  ping(): boolean;
  getStorageData(): StorageData | null;
  saveStorageData(data: StorageData): boolean;
  clearStorage(): boolean;
  HEYBE_EXTENSION_LOADED(value: boolean): void;
  HEYBE_AUTH_UPDATED(value: StorageData): void;
  unauthorized(errorMessage?: string): void;
}

const NAMESPACE = "heybe-extension-messaging";

class Messenger {
  private static instance: Messenger | null = null;
  public readonly messenger: ReturnType<
    typeof defineCustomEventMessaging<ProtocolMap>
  >;

  private constructor() {
    allowWindowMessaging(NAMESPACE);
    this.messenger = defineCustomEventMessaging<ProtocolMap>({
      namespace: NAMESPACE,
    });
    console.log(
      `[${new Date().toISOString()}] 🚀 [Messenger] Singleton initialized`
    );
  }

  public static getInstance(): Messenger {
    if (!Messenger.instance) {
      Messenger.instance = new Messenger();
    }
    return Messenger.instance;
  }

  // webext-bridge mesajlaşma sistemi
  public setupWebextBridge() {
    // Handle deneme message from webpage
    messenger.onMessage("saveStorageData", async (data): Promise<boolean> => {
      try {
        // Forward to background script
        const response = await sendMessage(
          "saveStorageData",
          { ...data.data } as unknown as Record<string, any>,
          "background"
        );
        // await storage.setItems([
        //   {
        //     key: "local:token",
        //     value: data.data.token,
        //   },
        //   {
        //     key: "local:user",
        //     value: data.data.user,
        //   },
        // ]);

        return (response as boolean) === true;
      } catch (error) {
        console.error(`❌ [Content Script] Error on saveStorageData:`, error);
        return false;
      }
    });

    messenger.onMessage(
      "getStorageData",
      async (): Promise<StorageData | null> => {
        try {
          // Forward to background script
          const response = await sendMessage(
            "getStorageData",
            {},
            "background"
          );
          // const response = await storage.getItems([
          //   "local:token",
          //   "local:user",
          // ]);
          console.log("getStorageData response:", response);

          const isEmpty =
            response === null ||
            (typeof response === "object" &&
              Object.keys(response).length === 0) ||
            response === undefined;
          console.log("isEmpty: ", isEmpty);
          if (isEmpty) {
            return null;
          }
          const formatted = (response as Record<string, any>)?.reduce(
            (
              acc: Record<string, any>,
              { key, value }: { key: string; value: any }
            ) => ({
              ...acc,
              [key.replace("local:", "")]: value,
            }),
            {}
          );
          console.log("getStorageData formatted:", formatted);

          return (formatted as StorageData) ?? null;
        } catch (error) {
          console.error(
            ` ❌ [Content Script] Error on getStorageData message:`,
            error
          );
          return null;
        }
      }
    );

    messenger.onMessage("clearStorage", async (): Promise<boolean> => {
      try {
        // Forward to background script
        const response = await sendMessage("clearStorage", {}, "background");
        // storage.removeItems(["local:token", "local:user"]);
        return (response as boolean) === true;
      } catch (error) {
        console.error(
          `❌ [Content Script] Error forwarding clearStorage message:`,
          error
        );
        return false;
      }
    });

    messenger.onMessage("ping", async (): Promise<boolean> => {
      try {
        // Forward to background script
        const response = await sendMessage("ping", {}, "background");

        return (response as boolean) === true;
      } catch (error) {
        console.error(
          `❌ [Content Script] Error forwarding ping message:`,
          error
        );
        return false;
      }
    });

    messenger.onMessage("unauthorized", ({ data }) => {});

    // Notify webpage that extension is loaded
    setTimeout(() => {
      messenger.sendMessage("HEYBE_EXTENSION_LOADED", true).catch((error) => {
        console.warn(
          `⚠️ [Content Script] Error sending HEYBE_EXTENSION_LOADED:`,
          error
        );
      });
    }, 500);
  }

  public notifyWebsiteAuth(data: StorageData) {
    console.log("Sending HEYBE_AUTH_UPDATED to website!");

    messenger.sendMessage("HEYBE_AUTH_UPDATED", data).catch((error) => {
      console.warn(
        `⚠️ [Content Script] Error sending HEYBE_EXTENSION_LOADED:`,
        error
      );
    });
  }
}

export const messenger = Messenger.getInstance().messenger;
export const listenWebsite = Messenger.getInstance().setupWebextBridge;
export const notifyWebsiteAuth = Messenger.getInstance().notifyWebsiteAuth;
