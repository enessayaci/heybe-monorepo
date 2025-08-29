import { defineCustomEventMessaging } from "@webext-core/messaging/page";
import { type StorageData } from "./extensionService";

const NAMESPACE = "heybe-extension-messaging";

interface ProtocolMap {
  ping(): boolean;
  getStorageData(): StorageData | null;
  saveStorageData(data: StorageData): boolean;
  clearStorage(): boolean;
  HEYBE_EXTENSION_LOADED(): boolean;
  HEYBE_AUTH_UPDATED(): boolean;
}

export const messenger = defineCustomEventMessaging<ProtocolMap>({
  namespace: NAMESPACE,
});
