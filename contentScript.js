// Tüm sitelerde çalışan content script
(function () {
  // Butonun id'si
  const BUTTON_ID = "my-list-sepet-btn";
  let buttonAdded = false;

  // Anahtar kelimeler
  const KEYWORDS = ["sepete ekle", "add to basket", "add", "ekle"];

  // API endpoint (Vercel + Neon DB)
  const API_ENDPOINT = "https://my-list-pi.vercel.app/api/add-product";

  function hasRelevantButton() {
    const buttons = Array.from(
      document.querySelectorAll(
        "button, a, input[type='button'], input[type='submit']"
      )
    );
    return buttons.some((btn) => {
      const text = (btn.innerText || btn.value || "").toLowerCase();
      return KEYWORDS.some((keyword) => text.includes(keyword));
    });
  }

  function getLargestImage() {
    const images = Array.from(document.images).filter(
      (img) => img.naturalWidth && img.naturalHeight
    );
    if (!images.length) return "";
    images.sort(
      (a, b) =>
        b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight
    );
    return images[0].src;
  }

  function getLargestHeading() {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
    if (!headings.length) return document.title || "";
    headings.sort((a, b) => b.textContent.length - a.textContent.length);
    return headings[0].textContent.trim();
  }

  function getFirstPriceText() {
    const priceRegex = /([₺$€£]\s?\d+[.,]?\d*)/;
    const treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    let node;
    while ((node = treeWalker.nextNode())) {
      if (priceRegex.test(node.textContent)) {
        return node.textContent.match(priceRegex)[0];
      }
    }
    return "";
  }

  function getClosestHeadingToElement(element) {
    if (!element) return "";
    // Parent ve yakınındaki başlıkları ara
    let parent = element.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      const heading = parent.querySelector("h1, h2, h3, strong, b, span");
      if (heading && heading.textContent.trim().length > 3) {
        return heading.textContent.trim();
      }
      parent = parent.parentElement;
    }
    // Kardeşlerinde başlık ara
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (
        /h1|h2|h3|strong|b|span/i.test(sibling.tagName) &&
        sibling.textContent.trim().length > 3
      ) {
        return sibling.textContent.trim();
      }
      sibling = sibling.previousElementSibling;
    }
    sibling = element.nextElementSibling;
    while (sibling) {
      if (
        /h1|h2|h3|strong|b|span/i.test(sibling.tagName) &&
        sibling.textContent.trim().length > 3
      ) {
        return sibling.textContent.trim();
      }
      sibling = sibling.nextElementSibling;
    }
    return "";
  }

  function getProductName() {
    // 1. Görsele ve fiyata yakın başlık
    const image = document.querySelector("img");
    const priceText = getFirstPriceText();
    let priceEl = null;
    if (priceText) {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.includes(priceText)) {
          priceEl = node.parentElement;
          break;
        }
      }
    }
    let name =
      getClosestHeadingToElement(image) || getClosestHeadingToElement(priceEl);
    if (name && name.length > 3) return name;
    // 2. h1[itemprop='name']
    let el = document.querySelector('h1[itemprop="name"]');
    if (el && el.textContent.trim().length > 3) return el.textContent.trim();
    // 3. h1
    el = document.querySelector("h1");
    if (el && el.textContent.trim().length > 3) return el.textContent.trim();
    // 4. meta[property="og:title"]
    el = document.querySelector('meta[property="og:title"]');
    if (el && el.content && el.content.trim().length > 3)
      return el.content.trim();
    // 5. document.title
    if (document.title && document.title.trim().length > 3)
      return document.title.trim();
    // 6. En uzun başlık
    return getLargestHeading();
  }

  function getProductInfo() {
    let name = getProductName();
    // Ürün adı filtreleme koşullarını gevşet
    if (
      /ürün|fiyat|sepete|ekle|alışveriş|basket|cart|add/i.test(name) &&
      name.length < 10
    ) {
      name = "";
    }
    const price = getFirstPriceText();
    let image = getLargestImage();
    const url = window.location.href;
    const site = window.location.hostname;

    // Eğer görsel yoksa boş string olarak bırak
    return { name, price, image, url, site };
  }

  async function saveProductToAPI(productInfo) {
    try {
      console.log("🚀 API'ye ürün gönderiliyor:", productInfo);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productInfo.name,
          price: productInfo.price,
          image_url: productInfo.image,
          product_url: productInfo.url,
          site: productInfo.site,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Ürün API'ye başarıyla kaydedildi:", result);
        return { success: true, data: result };
      } else {
        console.error("❌ API hatası:", result);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Network hatası:", error);
      return { success: false, error: error.message };
    }
  }

  function showConfirmation(success = true, message = null) {
    const div = document.createElement("div");
    div.textContent = success
      ? message || "Ürün My List Sepetine eklendi!"
      : message || "Ürün eklenirken hata oluştu!";
    div.setAttribute(
      "style",
      `position:fixed;top:20px;right:20px;background:${
        success ? "#16a34a" : "#dc2626"
      };color:white;padding:12px 20px;border-radius:8px;z-index:99999;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.15);`
    );
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  function addButton() {
    if (buttonAdded || document.getElementById(BUTTON_ID)) return;

    // Anahtar kelime içeren buton yoksa ekleme
    if (!hasRelevantButton()) return;

    if (document.body && document.body.children.length > 0) {
      const btn = document.createElement("button");
      btn.id = BUTTON_ID;
      btn.innerHTML = `
        <span class="my-list-btn-content" style="display:flex;align-items:center;gap:8px;">
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6h13' /></svg>
          <span class="my-list-btn-text">My List Sepetime Ekle</span>
        </span>
      `;
      btn.setAttribute("tabindex", "0");
      btn.setAttribute("aria-label", "My List Sepetime Ekle");
      btn.setAttribute("type", "button");
      btn.setAttribute(
        "style",
        `position:fixed;top:50%;right:0;transform:translateY(-50%);background:#2563eb;color:white;padding:0 8px 0 0;border:none;border-radius:24px 0 0 24px;font-size:18px;cursor:pointer;z-index:99999;box-shadow:0 2px 8px rgba(0,0,0,0.15);height:48px;min-width:32px;max-width:200px;transition:all 0.3s cubic-bezier(.4,0,.2,1);overflow:hidden;display:flex;align-items:center;justify-content:flex-start;`
      );
      btn.querySelector(".my-list-btn-text").style.display = "none";

      // Hover ile aç/kapa
      btn.addEventListener("mouseenter", () => {
        btn.style.maxWidth = "200px";
        btn.style.padding = "0 24px 0 12px";
        btn.querySelector(".my-list-btn-text").style.display = "inline";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.maxWidth = "32px";
        btn.style.padding = "0 8px 0 0";
        btn.querySelector(".my-list-btn-text").style.display = "none";
      });

      btn.addEventListener("click", async function handleClick() {
        btn.disabled = true;
        btn.querySelector(".my-list-btn-text").textContent = "Ekleniyor...";

        const product = getProductInfo();
        console.log("🔍 Tespit edilen ürün bilgileri:", product);

        if (product.url) {
          const result = await saveProductToAPI(product);

          if (result.success) {
            showConfirmation(true, "Ürün başarıyla eklendi!");
          } else {
            showConfirmation(false, `Hata: ${result.error}`);
          }
        } else {
          showConfirmation(false, "Ürün bilgileri yetersiz!");
        }

        btn.disabled = false;
        btn.querySelector(".my-list-btn-text").textContent =
          "My List Sepetime Ekle";
      });

      document.body.appendChild(btn);
      buttonAdded = true;
      console.log("✅ My List Sepetime Ekle butonu eklendi (hover gizli)");
    }
  }

  // Birden fazla yöntemle buton eklemeyi dene
  function tryAddButton() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addButton);
    } else {
      addButton();
    }
  }

  // İlk deneme
  tryAddButton();

  // Kısa aralıklarla tekrar dene
  setTimeout(tryAddButton, 500);
  setTimeout(tryAddButton, 1000);
  setTimeout(tryAddButton, 2000);
  setTimeout(tryAddButton, 3000);

  // MutationObserver ile dinamik değişiklikleri izle
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver((mutations) => {
      if (!buttonAdded) {
        tryAddButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // URL değişikliklerini izle (SPA'lar için)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      buttonAdded = false;
      tryAddButton();
    }
  }, 1000);
})();
