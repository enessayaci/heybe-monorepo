import React from "react";
import { createRoot } from "react-dom/client";
import { FloatingActionButton } from "../src/components/FloatingActionButton";
import "../src/globals.css";
import { defineContentScript } from "wxt/sandbox";
import { createShadowRootUi } from "wxt/client";

import { listenWebsite } from "../src/services/messenger";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    // Runtime handlers'ı başlat
    listenWebsite();

    const ui = await createShadowRootUi(ctx, {
      name: "heybe-content-script-ui",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        const root = createRoot(container);
        root.render(
          React.createElement(
            "div",
            { className: "heybe-extension-container" },
            React.createElement(FloatingActionButton)
          )
        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
