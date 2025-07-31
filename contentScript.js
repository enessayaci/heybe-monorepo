// Tüm sitelerde çalışan content script
(function () {
  // UUID oluşturma fonksiyonu
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Kullanıcı ID'sini al veya oluştur (IndexedDB Shared Storage ile)
  async function getUserId() {
    try {
      console.log("🔍 [Tüm Listem] UUID Kontrolü (IndexedDB shared storage):");

      // 1. IndexedDB'den kontrol et (shared storage)
      let userId = null;
      try {
        if (window.ExtensionSharedDB) {
          userId = await window.ExtensionSharedDB.getUUID();
          if (userId) {
            console.log("✅ [Tüm Listem] UUID IndexedDB'den alındı:", userId);
            // Extension storage'a da yaz (sync)
            await extensionStorage.set("tum_listem_user_id", userId);
            await extensionStorage.set("tum_listem_backup_uuid", userId);
            return userId;
          }
        }
      } catch (e) {
        console.log("❌ IndexedDB okunamadı:", e);
      }

      // 2. Extension storage'dan kontrol et (fallback)
      const [mainUUID, backupUUID] = await Promise.all([
        extensionStorage.get("tum_listem_user_id"),
        extensionStorage.get("tum_listem_backup_uuid"),
      ]);

      console.log("  Extension Ana UUID:", mainUUID);
      console.log("  Extension Backup UUID:", backupUUID);

      userId = mainUUID;

      // Ana UUID yoksa backup'tan dene
      if (!userId && backupUUID) {
        console.log(
          "🔄 [Tüm Listem] Ana UUID yok, backup UUID kullanılıyor:",
          backupUUID
        );
        userId = backupUUID;
        // Backup'ı ana UUID'ye restore et
        await extensionStorage.set("tum_listem_user_id", userId);
        console.log("✅ [Tüm Listem] Backup UUID restore edildi");
      }

      // Ana UUID var ama backup yoksa backup oluştur
      if (userId && !backupUUID) {
        console.log("💾 [Tüm Listem] Backup UUID oluşturuluyor:", userId);
        await extensionStorage.set("tum_listem_backup_uuid", userId);
      }

      // Ana UUID ve backup farklıysa, backup'ı kullan (eski verileri korumak için)
      if (userId && backupUUID && userId !== backupUUID) {
        console.log("⚠️ [Tüm Listem] UUID uyumsuzluğu tespit edildi!");
        console.log("  Ana UUID:", userId);
        console.log("  Backup UUID:", backupUUID);
        console.log(
          "🔄 [Tüm Listem] Backup UUID kullanılıyor (eski verileri korumak için):",
          backupUUID
        );
        userId = backupUUID;
        // Backup'ı ana UUID'ye restore et
        await extensionStorage.set("tum_listem_user_id", userId);
        console.log(
          "✅ [Tüm Listem] Backup UUID ana UUID olarak restore edildi"
        );
      }

      // Hala UUID yoksa yeni oluştur
      if (!userId) {
        userId = generateUUID();

        // IndexedDB'ye yaz (shared storage)
        try {
          if (window.ExtensionSharedDB) {
            await window.ExtensionSharedDB.setUUID(userId);
            console.log(
              "✅ [Tüm Listem] Yeni UUID IndexedDB'ye yazıldı:",
              userId
            );
          }
        } catch (e) {
          console.log("❌ IndexedDB yazılamadı:", e);
        }

        // Extension storage'a da yaz (backup)
        await extensionStorage.set("tum_listem_user_id", userId);
        await extensionStorage.set("tum_listem_backup_uuid", userId);

        console.log(
          "👤 [Tüm Listem] İlk kurulum - Yeni kullanıcı ID oluşturuldu:",
          userId,
          `(${extensionStorage.getBrowserName()})`
        );
      } else {
        console.log(
          "👤 [Tüm Listem] Mevcut kullanıcı ID:",
          userId,
          `(${extensionStorage.getBrowserName()})`
        );

        // IndexedDB'ye de yaz (sync)
        try {
          if (window.ExtensionSharedDB) {
            await window.ExtensionSharedDB.setUUID(userId);
            console.log("✅ [Tüm Listem] UUID IndexedDB'ye sync edildi");
          }
        } catch (e) {
          console.log("❌ IndexedDB sync edilemedi:", e);
        }
      }

      return userId;
    } catch (error) {
      console.error("❌ [Tüm Listem] Extension Storage hatası:", error);
      throw new Error("Extension Storage API'ye erişilemiyor!");
    }
  }

  // Butonun id'si
  const BUTTON_ID = "my-list-sepet-btn";
  let buttonAdded = false;

  // Anahtar kelimeler
  const KEYWORDS = [
    "sepete ekle",
    "add to basket",
    "add",
    "ekle",
    "sepete ekle",
    "sepete ekle",
    "satın al",
    "hemen al",
    "buy now",
    "add to cart",
    "sepet",
    "basket",
    "cart",
  ];

  // API endpoint (Vercel + Neon DB)
  const API_ENDPOINT = "https://my-list-pi.vercel.app/api/add-product";

  function hasRelevantButton() {
    // Ana sayfa kontrolü - eğer ana sayfa ise buton gösterilmesin
    const isHomePage = checkIfHomePage();
    if (isHomePage) {
      return false;
    }

    const buttons = Array.from(
      document.querySelectorAll(
        "button, a, input[type='button'], input[type='submit'], div[role='button'], div[onclick], span[role='button'], span[onclick], div[class*='btn'], span[class*='btn'], div[class*='button'], span[class*='button'], div[class*='add'], span[class*='add'], div[class*='cart'], span[class*='cart'], div[class*='basket'], span[class*='basket'], div[class*='sepete'], span[class*='sepete'], div[class*='ekle'], span[class*='ekle']"
      )
    );

    const relevantButtons = buttons.filter((btn) => {
      const text = (
        btn.innerText ||
        btn.value ||
        btn.textContent ||
        ""
      ).toLowerCase();
      const hasKeyword = KEYWORDS.some((keyword) => text.includes(keyword));
      return hasKeyword;
    });

    // Eğer hiç ilgili buton yoksa false döndür
    if (relevantButtons.length === 0) {
      return false;
    }

    return true;
  }

  function checkIfHomePage() {
    // Ana sayfa göstergeleri
    const homePageIndicators = [
      // URL göstergeleri
      () => {
        const path = window.location.pathname.toLowerCase();
        return (
          path === "/" ||
          path === "/home" ||
          path === "/anasayfa" ||
          path === "/index" ||
          path.includes("/home/") ||
          path.includes("/anasayfa/")
        );
      },

      // Sayfa başlığı göstergeleri
      () => {
        const title = document.title.toLowerCase();
        return (
          title.includes("ana sayfa") ||
          title.includes("homepage") ||
          title.includes("anasayfa") ||
          title.includes("home") ||
          title.includes("index")
        );
      },

      // Meta description göstergeleri
      () => {
        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (!metaDescription) return false;
        const content = metaDescription.content.toLowerCase();
        return (
          content.includes("ana sayfa") ||
          content.includes("homepage") ||
          content.includes("anasayfa") ||
          content.includes("home")
        );
      },

      // Ana sayfa elementleri
      () => {
        const homePageElements = [
          "hero",
          "banner",
          "slider",
          "carousel",
          "main-banner",
          "home-banner",
          "welcome",
          "hoşgeldiniz",
        ];

        return homePageElements.some((element) => {
          const elements = document.querySelectorAll(
            `[class*="${element}"], [id*="${element}"]`
          );
          return elements.length > 0;
        });
      },
    ];

    const positiveIndicators = homePageIndicators.filter((indicator) => {
      try {
        return indicator();
      } catch (e) {
        return false;
      }
    });

    return positiveIndicators.length >= 2;
  }

  function getLargestImage() {
    // Tüm resimleri topla - farklı kaynaklardan
    const allImages = [
      // Normal img tagları
      ...Array.from(document.querySelectorAll("img")),
      // Lazy loading için data-src, data-lazy-src vb.
      ...Array.from(document.querySelectorAll("img[data-src]")),
      ...Array.from(document.querySelectorAll("img[data-lazy-src]")),
      ...Array.from(document.querySelectorAll("img[data-original]")),
      // Background image olan div'ler
      ...Array.from(
        document.querySelectorAll("div[style*='background-image']")
      ),
      // Ürün resmi class'ları
      ...Array.from(document.querySelectorAll("[class*='product-image']")),
      ...Array.from(document.querySelectorAll("[class*='product-img']")),
      ...Array.from(document.querySelectorAll("[class*='item-image']")),
      ...Array.from(document.querySelectorAll("[class*='item-img']")),
    ];

    // Resim URL'lerini topla
    const imageUrls = [];

    allImages.forEach((img, index) => {
      let src = "";

      if (img.tagName === "IMG") {
        // Normal img tag
        src =
          img.src ||
          img.getAttribute("data-src") ||
          img.getAttribute("data-lazy-src") ||
          img.getAttribute("data-original");
      } else if (img.tagName === "DIV") {
        // Background image
        const style = img.style.backgroundImage;
        if (style && style.includes("url(")) {
          src = style.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || "";
        }
      }

      if (src && src.length > 0) {
        imageUrls.push({
          src: src,
          element: img,
          index: index,
        });
      }
    });

    // Resimleri filtrele ve sırala
    const validImages = imageUrls.filter((img) => {
      const src = img.src.toLowerCase();

      // Geçersiz resimleri filtrele
      const invalidPatterns = [
        "data:image",
        "placeholder",
        "blank",
        "empty",
        "default",
        "logo",
        "icon",
        "avatar",
        "profile",
        "banner",
        "ad",
        "loading",
        "spinner",
        "loader",
        "skeleton",
      ];

      return !invalidPatterns.some((pattern) => src.includes(pattern));
    });

    if (validImages.length === 0) {
      return "";
    }

    // En büyük resmi seç (URL'deki boyut bilgisine göre)
    const largestImage = validImages.reduce((largest, current) => {
      const currentSize = getImageSizeFromUrl(current.src);
      const largestSize = getImageSizeFromUrl(largest.src);

      if (currentSize > largestSize) {
        return current;
      }
      return largest;
    });

    return largestImage.src;
  }

  function getImageSizeFromUrl(url) {
    // URL'den boyut bilgisini çıkar (örn: image.jpg?w=800&h=600)
    const sizeMatch = url.match(/[?&](w|width|h|height)=(\d+)/g);
    if (sizeMatch) {
      const sizes = sizeMatch.map((match) => parseInt(match.split("=")[1]));
      return Math.max(...sizes);
    }

    // URL'de boyut yoksa varsayılan değer
    return 100;
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

  // Meta tag'leri çeken fonksiyon
  function getMetaTags() {
    const metaTags = {};

    // Title tag'ini al
    const titleElement = document.querySelector("title");
    if (titleElement) {
      metaTags.title = titleElement.textContent.trim();
    }

    // Meta tag'leri tara
    const metaElements = document.querySelectorAll("meta");
    metaElements.forEach((meta) => {
      const name = meta.getAttribute("name") || meta.getAttribute("property");
      const content = meta.getAttribute("content");

      if (name && content) {
        metaTags[name.toLowerCase()] = content;
      }
    });

    return metaTags;
  }

  // Fiyat için kapsamlı kontrol
  function getProductPrice(metaTags, domInfo) {
    // Meta tag öncelik sırası - indirimli fiyatlar önce
    const priceSources = [
      metaTags["og:price:sale_price"], // İndirimli fiyat (öncelik)
      metaTags["product:price:sale_price"], // E-ticaret indirimli fiyat
      metaTags["item:price:sale_price"], // Schema.org indirimli fiyat
      metaTags["sale_price"], // Genel indirimli fiyat
      metaTags["discount_price"], // İndirimli fiyat
      metaTags["final_price"], // Final fiyat
      metaTags["current_price"], // Güncel fiyat
      metaTags["og:price:amount"], // Normal fiyat
      metaTags["product:price:amount"], // E-ticaret normal fiyat
      metaTags["item:price:amount"], // Schema.org normal fiyat
      metaTags["price"], // Genel fiyat
      metaTags["product_price"], // Özel format
      metaTags["product-price"], // Kebab case
      metaTags["twitter:data1"], // Twitter
      metaTags["twitter:label1"], // Twitter label
      metaTags["price:amount"], // Alternatif
      metaTags["amount"], // Kısa
      metaTags["cost"], // Maliyet
      metaTags["value"], // Değer
      domInfo.price, // DOM fallback
    ];

    for (const source of priceSources) {
      if (source && source.trim()) {
        // Fiyat formatını temizle ve kontrol et
        const cleanPrice = source.replace(/[^\d.,]/g, "").trim();
        if (cleanPrice && cleanPrice.length > 0) {
          // Sayısal değer kontrolü
          const numericPrice = parseFloat(cleanPrice.replace(",", "."));
          if (!isNaN(numericPrice) && numericPrice > 0) {
            return cleanPrice;
          }
        }
      }
    }

    return "";
  }

  // DOM'dan bilgi çeken fonksiyon (fallback)
  function getDOMInfo() {
    let name = "";
    let price = "";
    let image_url = "";

    // Ürün adı - en büyük heading'i bul
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );
    if (headings.length > 0) {
      // En büyük heading'i seç (genelde h1 ürün adıdır)
      const mainHeading =
        headings.find((h) => h.tagName === "H1") || headings[0];
      name = mainHeading.textContent.trim();
    }

    // Fiyat - gelişmiş fiyat tespiti
    price = findPriceInDOM();

    // Resim - en büyük resmi bul
    image_url = getLargestImage();

    return { name, price, image_url };
  }

  // DOM'dan fiyat bulma fonksiyonu
  function findPriceInDOM() {
    // Fiyat için arama yapılacak selector'lar
    const priceSelectors = [
      '[class*="price"]',
      '[class*="fiyat"]',
      '[class*="cost"]',
      '[class*="amount"]',
      '[class*="value"]',
      '[class*="money"]',
      "span",
      "div",
      "p",
      "strong",
      "b",
    ];

    // Fiyat pattern'leri
    const pricePatterns = [
      /[\d.,]+\s*(₺|TL|\$|€)/, // 1000 ₺
      /(₺|TL|\$|€)\s*[\d.,]+/, // ₺ 1000
      /[\d.,]+\s*(TL|TRY|USD|EUR)/, // 1000 TL
      /(TL|TRY|USD|EUR)\s*[\d.,]+/, // TL 1000
      /fiyat[:\s]*[\d.,]+/i, // fiyat: 1000
      /price[:\s]*[\d.,]+/i, // price: 1000
      /cost[:\s]*[\d.,]+/i, // cost: 1000
      /[\d.,]+\s*(kuruş|cent)/i, // 1000 kuruş
      /[\d.,]+\s*(bin|milyon)/i, // 1000 bin
    ];

    // Tüm selector'ları dene
    for (const selector of priceSelectors) {
      const elements = document.querySelectorAll(selector);

      for (const element of elements) {
        const text = element.textContent.trim();

        // Pattern'leri kontrol et
        for (const pattern of pricePatterns) {
          if (pattern.test(text)) {
            // Fiyatı temizle
            const match = text.match(pattern);
            if (match) {
              const cleanPrice = match[0].replace(/[^\d.,]/g, "").trim();
              if (cleanPrice && cleanPrice.length > 0) {
                const numericPrice = parseFloat(cleanPrice.replace(",", "."));
                if (!isNaN(numericPrice) && numericPrice > 0) {
                  return cleanPrice;
                }
              }
            }
          }
        }

        // Ek kontroller
        if (
          text.match(/[\d.,]+/) &&
          (text.includes("₺") ||
            text.includes("TL") ||
            text.includes("$") ||
            text.includes("€"))
        ) {
          const cleanPrice = text.replace(/[^\d.,]/g, "").trim();
          if (cleanPrice && cleanPrice.length > 0) {
            const numericPrice = parseFloat(cleanPrice.replace(",", "."));
            if (!isNaN(numericPrice) && numericPrice > 0) {
              return cleanPrice;
            }
          }
        }
      }
    }

    return "";
  }

  // Gelişmiş ürün bilgisi çekme fonksiyonu
  function getProductInfo() {
    // Meta tag'lerden bilgi çek
    const metaTags = getMetaTags();

    // DOM'dan da bilgi çek (fallback için)
    const domInfo = getDOMInfo();

    // Kapsamlı meta tag kontrolü
    const productInfo = {
      name: getProductName(metaTags, domInfo),
      price: getProductPrice(metaTags, domInfo),
      image_url: getProductImage(metaTags, domInfo),
      product_url: window.location.href,
      site: window.location.hostname,
    };

    return productInfo;
  }

  // Ürün adı için kapsamlı kontrol
  function getProductName(metaTags, domInfo) {
    // Meta tag öncelik sırası
    const nameSources = [
      metaTags["og:title"],
      metaTags["twitter:title"],
      metaTags.title,
      metaTags["product:name"],
      metaTags["item:name"],
      metaTags["name"],
      metaTags["product_name"],
      metaTags["product-name"],
      domInfo.name,
    ];

    for (const source of nameSources) {
      if (source && source.trim()) {
        return source.trim();
      }
    }

    return "Ürün";
  }

  // Fiyat için kapsamlı kontrol
  function getProductPrice(metaTags, domInfo) {
    // Meta tag öncelik sırası
    const priceSources = [
      metaTags["og:price:amount"],
      metaTags["product:price:amount"],
      metaTags["item:price:amount"],
      metaTags["price"],
      metaTags["product_price"],
      metaTags["product-price"],
      metaTags["twitter:data1"],
      metaTags["twitter:label1"],
      metaTags["price:amount"],
      metaTags["amount"],
      domInfo.price,
    ];

    for (const source of priceSources) {
      if (source && source.trim()) {
        // Fiyat formatını temizle
        const cleanPrice = source.replace(/[^\d.,]/g, "").trim();
        if (cleanPrice) {
          return cleanPrice;
        }
      }
    }

    return "";
  }

  // Resim için kapsamlı kontrol
  function getProductImage(metaTags, domInfo) {
    // Meta tag öncelik sırası
    const imageSources = [
      metaTags["og:image"],
      metaTags["twitter:image"],
      metaTags["image"],
      metaTags["product:image"],
      metaTags["item:image"],
      metaTags["product_image"],
      metaTags["product-image"],
      metaTags["thumbnail"],
      metaTags["photo"],
      metaTags["picture"],
      domInfo.image_url,
    ];

    for (const source of imageSources) {
      if (source && source.trim() && isValidImageUrl(source)) {
        return source.trim();
      }
    }

    // Meta tag'lerde resim yoksa DOM'dan akıllıca bul
    return findProductImageFromDOM();
  }

  // DOM'dan ürün resmi bulma
  function findProductImageFromDOM() {
    console.log("🔍 [Tüm Listem] DOM'dan ürün resmi aranıyor...");

    // 1. Başlık yakınındaki resimler
    const titleImages = findImagesNearTitle();
    if (titleImages.length > 0) {
      console.log(
        "✅ [Tüm Listem] Başlık yakınında resim bulundu:",
        titleImages[0]
      );
      return titleImages[0];
    }

    // 2. Ürün galerisi/resim listesi
    const galleryImages = findGalleryImages();
    if (galleryImages.length > 0) {
      console.log("✅ [Tüm Listem] Galeri resmi bulundu:", galleryImages[0]);
      return galleryImages[0];
    }

    // 3. Ana ürün resmi
    const mainImages = findMainProductImages();
    if (mainImages.length > 0) {
      console.log("✅ [Tüm Listem] Ana ürün resmi bulundu:", mainImages[0]);
      return mainImages[0];
    }

    console.log("❌ [Tüm Listem] DOM'da uygun resim bulunamadı");
    return "";
  }

  // Başlık yakınındaki resimleri bul
  function findImagesNearTitle() {
    const images = [];

    // Başlık elementlerini bul
    const titleSelectors = [
      "h1",
      "h2",
      "h3",
      '[class*="title"]',
      '[class*="product-name"]',
      '[class*="product-title"]',
      '[id*="title"]',
      '[id*="product-name"]',
      '[id*="product-title"]',
    ];

    for (const selector of titleSelectors) {
      const titles = document.querySelectorAll(selector);

      for (const title of titles) {
        // Başlık metnini kontrol et (ürün başlığı olabilir mi?)
        const titleText = title.textContent?.toLowerCase() || "";
        if (titleText.length > 10 && titleText.length < 200) {
          // Başlığın yakınındaki resimleri bul (parent, sibling, child)
          const nearbyImages = findImagesNearElement(title);
          images.push(...nearbyImages);
        }
      }
    }

    return filterValidImages(images);
  }

  // Galeri/resim listesi bul
  function findGalleryImages() {
    const images = [];

    // Galeri container'ları
    const gallerySelectors = [
      '[class*="gallery"]',
      '[class*="slider"]',
      '[class*="carousel"]',
      '[class*="images"]',
      '[class*="photos"]',
      '[class*="pictures"]',
      '[id*="gallery"]',
      '[id*="slider"]',
      '[id*="carousel"]',
      '[id*="images"]',
      '[id*="photos"]',
      '[id*="pictures"]',
    ];

    for (const selector of gallerySelectors) {
      const galleries = document.querySelectorAll(selector);

      for (const gallery of galleries) {
        const galleryImages = gallery.querySelectorAll("img");
        images.push(...Array.from(galleryImages));
      }
    }

    return filterValidImages(images);
  }

  // Ana ürün resimleri bul
  function findMainProductImages() {
    const images = [];

    // Ürün container'ları
    const productSelectors = [
      '[class*="product"]',
      '[class*="item"]',
      '[class*="goods"]',
      '[id*="product"]',
      '[id*="item"]',
      '[id*="goods"]',
    ];

    for (const selector of productSelectors) {
      const products = document.querySelectorAll(selector);

      for (const product of products) {
        const productImages = product.querySelectorAll("img");
        images.push(...Array.from(productImages));
      }
    }

    return filterValidImages(images);
  }

  // Element yakınındaki resimleri bul
  function findImagesNearElement(element) {
    const images = [];

    // Parent'ta resim var mı?
    const parentImages = element.parentElement?.querySelectorAll("img") || [];
    images.push(...Array.from(parentImages));

    // Sibling'larda resim var mı?
    const siblings = element.parentElement?.children || [];
    for (const sibling of siblings) {
      if (sibling !== element) {
        const siblingImages = sibling.querySelectorAll("img");
        images.push(...Array.from(siblingImages));
      }
    }

    // Child'larda resim var mı?
    const childImages = element.querySelectorAll("img");
    images.push(...Array.from(childImages));

    return images;
  }

  // Geçerli resimleri filtrele
  function filterValidImages(images) {
    const validImages = [];

    for (const img of images) {
      const src =
        img.src ||
        img.getAttribute("data-src") ||
        img.getAttribute("data-lazy-src");

      if (src && isValidImageUrl(src)) {
        // Resim boyutunu kontrol et (çok küçük olmasın)
        const width = img.naturalWidth || img.offsetWidth || img.width;
        const height = img.naturalHeight || img.offsetHeight || img.height;

        if (width >= 100 && height >= 100) {
          // Logo, icon gibi küçük resimleri filtrele
          const alt = img.alt?.toLowerCase() || "";
          const className = img.className?.toLowerCase() || "";

          if (
            !alt.includes("logo") &&
            !alt.includes("icon") &&
            !className.includes("logo") &&
            !className.includes("icon")
          ) {
            validImages.push(src);
          }
        }
      }
    }

    return validImages;
  }

  // Resim URL'sinin geçerli olup olmadığını kontrol et
  function isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function saveProductToAPI(productInfo) {
    try {
      const userId = await getUserId();

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productInfo.name,
          price: productInfo.price,
          image_url: productInfo.image_url,
          product_url: productInfo.product_url,
          site: productInfo.site,
          user_id: userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function showConfirmation(success = true, message = null) {
    const div = document.createElement("div");
    div.textContent = success
      ? message || "Ürün Tüm Listeme eklendi!"
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
    if (buttonAdded || document.getElementById(BUTTON_ID)) {
      return;
    }

    // Anahtar kelime içeren buton yoksa ekleme
    const hasRelevant = hasRelevantButton();

    if (!hasRelevant) {
      return;
    }

    if (document.body && document.body.children.length > 0) {
      const btn = document.createElement("button");
      btn.id = BUTTON_ID;
      btn.innerHTML = `
        <span class="my-list-btn-content" style="display:flex;align-items:center;gap:8px;">
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6h13' /></svg>
          <span class="my-list-btn-text">Tüm Listeme Ekle</span>
        </span>
      `;
      btn.setAttribute("tabindex", "0");
      btn.setAttribute("aria-label", "Tüm Listeme Ekle");
      btn.setAttribute("type", "button");
      btn.setAttribute(
        "style",
        `position:fixed;top:50%;right:0;transform:translateY(-50%);background:#2563eb;color:white;padding:0 24px 0 12px;border:none;border-radius:24px 0 0 24px;font-size:18px;cursor:pointer;z-index:99999;box-shadow:0 2px 8px rgba(0,0,0,0.15);height:48px;width:200px;transition:margin-right 0.3s cubic-bezier(.4,0,.2,1);overflow:hidden;display:flex;align-items:center;justify-content:flex-start;margin-right:-168px;`
      );
      btn.querySelector(".my-list-btn-text").style.display = "inline";

      // Hover ile aç/kapa - margin ile
      btn.addEventListener("mouseenter", () => {
        btn.style.marginRight = "0px";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.marginRight = "-168px";
      });

      btn.addEventListener("click", async function handleClick() {
        btn.disabled = true;
        btn.querySelector(".my-list-btn-text").textContent = "Ekleniyor...";

        const product = getProductInfo();
        console.log("🔍 [Tüm Listem] Ürün tespit edildi:", product.name);

        if (product.product_url) {
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
        btn.querySelector(".my-list-btn-text").textContent = "Tüm Listeme Ekle";
      });

      document.body.appendChild(btn);
      buttonAdded = true;
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
