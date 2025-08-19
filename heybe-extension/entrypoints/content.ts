import React from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingActionButton } from '../src/components/FloatingActionButton';
import '../src/globals.css';
import { defineContentScript } from 'wxt/sandbox';
import { createShadowRootUi } from 'wxt/client';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    // E-ticaret sitelerini kontrol et - şu an için her sitede göster
    const isEcommerceSite = () => {
      // Kontroller devre dışı - her sitede göster
      return true;
      
      // Gelecekte kullanılabilecek e-ticaret site kontrolleri:
      // const hostname = window.location.hostname.toLowerCase();
      // const ecommerceSites = [
      //   'amazon.com', 'ebay.com', 'shopify.com', 'etsy.com',
      //   'trendyol.com', 'hepsiburada.com', 'n11.com', 'gittigidiyor.com'
      // ];
      // return ecommerceSites.some(site => hostname.includes(site));
    };

    // Şu an için tüm sitelerde çalıştır
    if (!isEcommerceSite()) {
      return;
    }

    // WXT'nin createShadowRootUi API'sini kullan - await eklendi
    const ui = await createShadowRootUi(ctx, {
      name: 'heybe-floating-button',
      position: 'inline',
      anchor: 'body',
      append: 'last',
      onMount: (container) => {
        // Container'a React uygulamasını mount et
        const root = createRoot(container);
        root.render(
          React.createElement(FloatingActionButton, {
            onProductSaved: () => {
              console.log('Product saved successfully!');
            }
          })
        );
        return root;
      },
      onRemove: (root) => {
        // Unmount the app when the UI is removed
        root?.unmount();
      },
    });

    // UI'yi mount et
    ui.mount();
  },
});
