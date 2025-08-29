import { onMessage } from "webext-bridge/background";
import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";

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
});
