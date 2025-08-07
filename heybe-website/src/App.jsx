import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProductCard from "./components/ProductCard";
import StatsCard from "./components/StatsCard";
import Sidebar from "./components/Sidebar";
import SimpleStorageHelper from "./utils/simpleStorage";

function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showWarning, setShowWarning] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [uuidType, setUuidType] = useState(null); // 'guest' veya 'permanent'
  const [userRole, setUserRole] = useState("user"); // 'user' veya 'admin'
  const [isGettingUserId, setIsGettingUserId] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState("chrome"); // 'chrome' veya 'safari'
  const [currentLanguage, setCurrentLanguage] = useState("en"); // 'tr' veya 'en'
  const [showExtensionWarning, setShowExtensionWarning] = useState(false); // Extension uyarısı
  const [extensionWarningDismissed, setExtensionWarningDismissed] =
    useState(false); // Uyarı kapatıldı mı?

  // Çeviriler
  const translations = {
    tr: {
      // Header & Navigation
      products: "Ürünlerim",
      install: "Kurulum",
      developer: "Geliştirici",

      // Main Content
      title: "Heybe - Alışveriş Sepeti",
      subtitle: "E-ticaret sitelerinden ürünleri kaydet ve karşılaştır",
      installInstructions: "Kurulum Talimatları",
      chromeInstall: "Chrome / Brave Kurulumu",
      safariInstall: "Safari Kurulumu",
      downloadExtension: "Extension dosyalarını indirin",
      chromeDownload: "Chrome İndir",
      safariDownload: "Safari İndir",

      // Installation Steps
      step1Chrome: "Chrome/Brave'de chrome://extensions/ adresine gidin",
      step2Chrome: 'Sağ üst köşeden "Developer mode" açın',
      step3Chrome: '"Load unpacked" butonuna tıklayın',
      step4Chrome: "İndirdiğiniz ve açtığınız chrome klasörünü seçin",
      step5Chrome: "✅ Extension aktif olacak ve kullanıma hazır!",

      step1Safari: "Safari menüsünden Ayarlar açın",
      step2Safari: "Geliştirici sekmesine gidin",
      step3Safari: '"İmzalanmamış Genişletmelere İzin Ver" işaretleyin',
      step4Safari: 'Altında çıkan "Genişletici Yükle" butonuna tıklayın',
      step5Safari: "İndirdiğiniz ve açtığınız safari klasörünü seçin",
      step6Safari: '"Tüm Sitelerde İzin Ver" seçin',
      step7Safari: "✅ Extension aktif olacak ve kullanıma hazır!",

      // Usage Guide
      usageGuide: "Kurulum Sonrası Kullanım Kılavuzu",
      usageStep1: "Herhangi bir e-ticaret sitesine gidin",
      usageStep2: 'Ürün sayfasında "Heybeye Ekle" butonunu görürsünüz',

      // Developer Info
      developerInfo: "Geliştirici Bilgileri",
      technicalSpecs: "Teknik Özellikler",
      technicalInfra: "Teknik Altyapı",

      // Buttons
      refresh: "Yenile",
      test: "Test",
      storageDebug: "Storage Debug",

      // Messages
      noProducts: "Henüz ürün eklenmemiş",
      loading: "Yükleniyor...",
      error: "Hata oluştu",

      // Status Messages
      productsCount: "ürün",
      sitesCount: "farklı site",
      lastUpdate: "Son güncelleme:",
      noProductsYet: "Henüz ürün yok",
      extensionNotInstalled: "Eklenti Kurulu Değil",
      installExtensionMessage:
        "Ürünlerinizi görmek ve yönetmek için önce browser eklentisini kurmanız gerekiyor.",
      viewInstallInstructions: "Kurulum Talimatlarını Gör",
      refreshPageAfterInstall: "Eklentiyi kurduysanız sayfayı yenileyin",
      warning:
        "Dikkat! Bazı bilgiler kaynak siteyi tarama sırasında yanlış alınabilir.",

      // Extension Warning
      extensionNotFoundWarning:
        "Eklenti bulunamadı! Yeni ürün eklemek için eklentiyi kurmanız gerekiyor.",
      installExtension: "Eklentiyi Kur",

      // Language
      language: "Dil",
      turkish: "Türkçe",
      english: "English",

      // Auth
      login: "Giriş Yap",
      register: "Kayıt Ol",
      loginShort: "Giriş",
      registerShort: "Kayıt",
      cancel: "İptal",
      loggedIn: "Giriş Yapıldı",
      guest: "Misafir",

      // Form Placeholders
      emailPlaceholder: "E-posta",
      passwordPlaceholder: "Şifre",
      namePlaceholder: "Ad (opsiyonel)",
      searchPlaceholder: "Ürün adı, site adı veya fiyat ile ara...",

      // Safari Note
      safariNote:
        'Güncel Safari sürümlerinde "İmzalanmamış Genişletmelere İzin Ver" seçeneği görünmüyorsa, önce Safari > Ayarlar > Gelişmiş > "Geliştir menüsünü göster" aktif edin.',
    },
    en: {
      // Header & Navigation
      products: "My Products",
      install: "Installation",
      developer: "Developer",

      // Main Content
      title: "Heybe - Shopping Basket",
      subtitle: "Save and compare products from e-commerce sites",
      installInstructions: "Installation Instructions",
      chromeInstall: "Chrome / Brave Installation",
      safariInstall: "Safari Installation",
      downloadExtension: "Download extension files",
      chromeDownload: "Download Chrome",
      safariDownload: "Download Safari",

      // Installation Steps
      step1Chrome: "Go to chrome://extensions/ in Chrome/Brave",
      step2Chrome: 'Enable "Developer mode" from the top right corner',
      step3Chrome: 'Click "Load unpacked" button',
      step4Chrome: "Select the downloaded and extracted chrome folder",
      step5Chrome: "✅ Extension will be active and ready to use!",

      step1Safari: "Open Settings from Safari menu",
      step2Safari: "Go to Developer tab",
      step3Safari: 'Check "Allow Unsigned Extensions"',
      step4Safari: 'Click "Load Extension" button that appears below',
      step5Safari: "Select the downloaded and extracted safari folder",
      step6Safari: 'Select "Allow on All Websites"',
      step7Safari: "✅ Extension will be active and ready to use!",

      // Usage Guide
      usageGuide: "Post-Installation Usage Guide",
      usageStep1: "Go to any e-commerce website",
      usageStep2: 'You will see "Add to Heybe" button on product pages',

      // Developer Info
      developerInfo: "Developer Information",
      technicalSpecs: "Technical Specifications",
      technicalInfra: "Technical Infrastructure",

      // Buttons
      refresh: "Refresh",
      test: "Test",
      storageDebug: "Storage Debug",

      // Messages
      noProducts: "No products added yet",
      loading: "Loading...",
      error: "An error occurred",

      // Status Messages
      productsCount: "products",
      sitesCount: "different sites",
      lastUpdate: "Last update:",
      noProductsYet: "No products yet",
      extensionNotInstalled: "Extension Not Installed",
      installExtensionMessage:
        "You need to install the browser extension first to view and manage your products.",
      viewInstallInstructions: "View Installation Instructions",
      refreshPageAfterInstall:
        "Refresh the page if you have installed the extension",
      warning:
        "Warning! Some information may be incorrectly retrieved while scanning the source site.",

      // Extension Warning
      extensionNotFoundWarning:
        "Extension not found! You need to install the extension to add new products.",
      installExtension: "Install Extension",

      // Language
      language: "Language",
      turkish: "Türkçe",
      english: "English",

      // Auth
      login: "Log In",
      register: "Sign Up",
      loginShort: "Log In",
      registerShort: "Sign Up",
      cancel: "Cancel",
      loggedIn: "Logged In",
      guest: "Guest",

      // Form Placeholders
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      namePlaceholder: "Name (optional)",
      searchPlaceholder: "Search by product name, site name or price...",

      // Safari Note
      safariNote:
        'If you don\'t see the "Allow Unsigned Extensions" option in current Safari versions, first enable Safari > Settings > Advanced > "Show Develop menu in menu bar".',
    },
  };

  // Çeviri fonksiyonu
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  // Tarayıcı dilini algıla
  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith("tr")) {
      return "tr";
    }
    return "en"; // Varsayılan İngilizce
  };

  // Dil değiştirme fonksiyonu
  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem("heybe_language", lang);
    console.log(`🌍 Dil değiştirildi: ${lang}`);
  };

  // AbortController için ref
  const abortControllerRef = React.useRef(null);

  // Cross-browser storage helper
  const storageHelper = new SimpleStorageHelper();

  // Extension kontrol fonksiyonu
  const checkExtensionAvailability = async () => {
    try {
      // İlk olarak PostMessage ile kontrol et (en güvenilir yöntem)
      const postMessageTest = await new Promise((resolve) => {
        let resolved = false;

        const messageHandler = (event) => {
          if (event.data.action === "EXTENSION_TEST_RESPONSE" && !resolved) {
            resolved = true;
            window.removeEventListener("message", messageHandler);
            console.log(
              "✅ [Extension Check] PostMessage ile extension bulundu"
            );
            resolve({ available: true, type: "postmessage" });
          }
        };

        window.addEventListener("message", messageHandler);

        // Test mesajı gönder
        window.postMessage({ action: "EXTENSION_TEST", data: {} }, "*");

        // 500ms timeout
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            window.removeEventListener("message", messageHandler);
            resolve({ available: false, type: "none" });
          }
        }, 500);
      });

      if (postMessageTest.available) {
        return postMessageTest;
      }

      // Chrome extension kontrolü (fallback)
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.id
      ) {
        try {
          // Extension'a test mesajı gönder
          const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Extension timeout"));
            }, 1000); // 1 saniye timeout

            chrome.runtime.sendMessage({ action: "test" }, (response) => {
              clearTimeout(timeout);
              if (chrome.runtime.lastError) {
                console.log(
                  "🔍 [Extension Check] Chrome runtime error:",
                  chrome.runtime.lastError
                );
                reject(new Error("Extension yanıt vermiyor"));
              } else {
                resolve(response);
              }
            });
          });
          console.log(
            "✅ [Extension Check] Chrome extension mevcut ve yanıt veriyor"
          );
          return { available: true, type: "chrome" };
        } catch (msgError) {
          console.log(
            "⚠️ [Extension Check] Chrome extension mevcut ama yanıt vermiyor:",
            msgError
          );
          // Extension API'si var ama yanıt vermiyor - yine de mevcut sayalım
          return { available: true, type: "chrome" };
        }
      }

      // Firefox extension kontrolü
      if (
        typeof browser !== "undefined" &&
        browser.runtime &&
        browser.runtime.id
      ) {
        console.log("✅ [Extension Check] Firefox extension mevcut");
        return { available: true, type: "firefox" };
      }

      console.log("❌ [Extension Check] Extension bulunamadı");
      return { available: false, type: "none" };
    } catch (error) {
      console.log("❌ [Extension Check] Extension kontrol hatası:", error);
      return { available: false, type: "none" };
    }
  };

  // API endpoint'leri - Vercel + Neon DB
  const API_BASE = "https://my-heybe.vercel.app/api";
  const GET_PRODUCTS_ENDPOINT = `${API_BASE}/get-products`;
  const DELETE_PRODUCT_ENDPOINT = `${API_BASE}/delete-product`;
  const DELETE_ALL_PRODUCTS_ENDPOINT = `${API_BASE}/delete-all-products`;
  const ADD_PRODUCT_ENDPOINT = `${API_BASE}/add-product`;
  const LOGIN_ENDPOINT = `${API_BASE}/login`;
  const REGISTER_ENDPOINT = `${API_BASE}/register`;

  // Sidebar toggle handler
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Arama fonksiyonu - debounce ile
  const handleSearch = (value) => {
    setSearchTerm(value);

    // Önceki timeout'u temizle
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Yeni timeout ayarla
    const newTimeout = setTimeout(() => {
      if (value.trim() === "") {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter((product) => {
          const searchLower = value.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchLower) ||
            product.site.toLowerCase().includes(searchLower) ||
            (product.price && product.price.includes(searchLower))
          );
        });
        setFilteredProducts(filtered);
      }
    }, 500);

    setSearchTimeout(newTimeout);
  };

  // Debug fonksiyonu
  const handleDebug = () => {
    console.log("🔧 Debug butonu tıklandı");
    console.log("📦 Mevcut ürünler:", products);
    console.log("👤 Current User ID:", currentUserId);
    console.log("🔐 isLoggedIn:", isLoggedIn);
    console.log("📋 UUID Type:", uuidType);
    alert("Debug bilgileri console'da görünüyor!");
  };

  // Refresh fonksiyonu
  const handleRefresh = async () => {
    console.log("🔄 Refresh butonu tıklandı");
    try {
      setStatus("loading");

      // currentUserId kullan (getUserId() çağırma!)
      if (!currentUserId) {
        console.log("❌ [handleRefresh] currentUserId yok");
        setError("Kullanıcı ID bulunamadı");
        setStatus("error");
        return;
      }

      const response = await fetch(
        `${GET_PRODUCTS_ENDPOINT}?user_id=${currentUserId}`
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setFilteredProducts(data.products || []); // Başlangıçta tüm ürünler
        setStatus("success");
      } else {
        setError("Ürünler yüklenirken hata oluştu");
        setStatus("error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Network hatası");
      setStatus("error");
    }
  };

  // Sayfa ilk yüklendiğinde ürünleri çek
  useEffect(() => {
    // Dil algılama ve ayarlama
    const savedLanguage = localStorage.getItem("heybe_language");
    if (savedLanguage && (savedLanguage === "tr" || savedLanguage === "en")) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Tarayıcı dilini algıla
      const detectedLang = detectBrowserLanguage();
      setCurrentLanguage(detectedLang);
      localStorage.setItem("heybe_language", detectedLang);
    }

    // Extension kontrolü - biraz gecikme ile yap (extension yüklensin diye)
    const checkExtensionStatus = async () => {
      try {
        // İlk kontrol
        const extensionStatus = await checkExtensionAvailability();
        console.log("🔍 [Extension Check] İlk durum:", extensionStatus);

        if (!extensionStatus.available) {
          // Extension bulunamadıysa, 2 saniye bekleyip tekrar kontrol et
          console.log(
            "⏳ [Extension Check] Extension bulunamadı, 2 saniye bekleyip tekrar kontrol ediliyor..."
          );
          setTimeout(async () => {
            try {
              const secondCheck = await checkExtensionAvailability();
              console.log("🔍 [Extension Check] İkinci durum:", secondCheck);

              if (!secondCheck.available && !extensionWarningDismissed) {
                console.log(
                  "❌ [Extension Check] Extension hala bulunamadı, uyarı gösteriliyor"
                );
                setShowExtensionWarning(true);
              } else {
                console.log(
                  "✅ [Extension Check] Extension ikinci kontrolde bulundu"
                );
                setShowExtensionWarning(false);
              }
            } catch (error) {
              console.error(
                "❌ [Extension Check] İkinci kontrol hatası:",
                error
              );
              setShowExtensionWarning(true);
            }
          }, 2000);
        } else {
          console.log("✅ [Extension Check] Extension ilk kontrolde bulundu");
          setShowExtensionWarning(false);
        }
      } catch (error) {
        console.error("❌ [Extension Check] İlk kontrol hatası:", error);
        setShowExtensionWarning(true);
      }
    };

    // Extension kontrolünü hemen yap
    checkExtensionStatus();

    (async () => {
      try {
        // DEBUG: Storage durumunu kontrol et
        console.log(
          "🔍 [DEBUG] Sayfa yüklendi, storage durumu kontrol ediliyor..."
        );
        const debugInfo = await storageHelper.debugStatus();
        console.log("🔍 [DEBUG] Tam rapor:", debugInfo);

        const uuid = await getActiveUUID(); // UUID hazırla (storage.local öncelik)

        // UUID varsa ürünleri çek
        if (uuid) {
          console.log("✅ [useEffect] UUID mevcut, ürünler çekiliyor...");
          await fetchProducts();
        } else {
          console.log(
            "⚠️ [useEffect] UUID alınamadı, extension durumu kontrol ediliyor..."
          );

          // Extension gerçekten kurulu mu kontrol et
          const extensionStatus = await checkExtensionAvailability();
          console.log("🔍 [useEffect] Extension durumu:", extensionStatus);

          if (!extensionStatus.available) {
            console.log("❌ [useEffect] Extension kurulu değil");
            // Extension uyarısı zaten gösteriliyor, sadece loading'i durdur
            setStatus("ready");
          } else {
            console.log(
              "⚠️ [useEffect] Extension kurulu ama UUID alınamadı, error durumu"
            );
            setStatus("error");
            setError(
              "Extension kurulu ama UUID alınamadı. Lütfen extension'ı yeniden yükleyin."
            );
          }
        }
      } catch (e) {
        console.error("Initial fetch error", e);
      }
    })();

    // Extension'dan aktif UUID event'ini dinle
    const handleExtensionActiveUUID = (event) => {
      console.log(
        "📨 [Web Site] extensionActiveUUIDSet event alındı:",
        event.detail
      );

      const { uuid, type } = event.detail;

      // Eğer aynı UUID zaten set edilmişse tekrar işlem yapma
      if (currentUserId === uuid) {
        console.log("⚠️ [Event] Aynı UUID zaten set edilmiş, işlem yapılmıyor");
        return;
      }

      // Extension'dan gelen UUID'yi storage'a kaydet
      if (type === "permanent") {
        storageHelper.setUserId(uuid, "permanent").then(() => {
          console.log("✅ [Event] Extension UUID storage'a kaydedildi:", uuid);
        });
      }

      setCurrentUserId(uuid);
      setUuidType(type);
      // isLoggedIn state'ini doğru şekilde set et
      setIsLoggedIn(type === "permanent");

      // Guest kullanıcı ise uyarı göster
      if (type === "guest") {
        setShowGuestWarning(true);
      }

      console.log("✅ [Event] Aktif UUID set edildi:", {
        uuid,
        type,
        isLoggedIn: type === "permanent",
      });
    };

    // Extension'dan login status event'ini dinle

    // Extension'dan permanent UUID isteği dinle - Şimdilik devre dışı
    const handleExtensionPermanentUUIDRequest = (event) => {
      // Bu fonksiyon şimdilik devre dışı bırakıldı
      // Extension zaten extensionActiveUUIDSet event'i ile UUID gönderiyor
      return;
    };

    window.addEventListener(
      "extensionActiveUUIDSet",
      handleExtensionActiveUUID
    );

    // Sadece extension'dan gelen mesajları dinle
    window.addEventListener("message", handleExtensionPermanentUUIDRequest);

    // Basit: UUID hazır olduğunda ürünleri çek
    console.log("🚀 [Basit] Sayfa yüklendi, UUID kontrol ediliyor...");

    // Extension hazır olmasını bekle
    const waitForExtension = () => {
      return new Promise((resolve) => {
        if (
          typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.id
        ) {
          console.log("✅ [Basit] Extension zaten mevcut");
          resolve();
          return;
        }

        console.log("⏳ [Basit] Extension hazır olması bekleniyor...");

        // Extension hazır olmasını kontrol et
        const checkExtension = () => {
          if (
            typeof chrome !== "undefined" &&
            chrome.runtime.id &&
            chrome.runtime.id
          ) {
            console.log("✅ [Basit] Extension hazır oldu");
            resolve();
            return;
          }

          // 3 saniye daha bekle
          setTimeout(checkExtension, 1000);
        };

        checkExtension();

        // Timeout: 5 saniye sonra devam et
        setTimeout(() => {
          console.log("⚠️ [Basit] Extension timeout, devam ediliyor");
          resolve();
        }, 5000);
      });
    };

    // ContentScript'ten gelen UUID event'ini bekle
    console.log("🚀 [Basit] ContentScript'ten UUID event'i bekleniyor...");
    // handleExtensionActiveUUID fonksiyonu zaten UUID'yi alıp set edecek

    return () => {
      window.removeEventListener(
        "extensionActiveUUIDSet",
        handleExtensionActiveUUID
      );

      window.removeEventListener(
        "message",
        handleExtensionPermanentUUIDRequest
      );
    };
  }, []);

  // currentUserId değiştiğinde fetchProducts çağır
  useEffect(() => {
    if (currentUserId) {
      console.log(
        "🔄 [currentUserId] Değişti, fetchProducts çağırılıyor:",
        currentUserId
      );
      fetchProducts();
    } else {
    }

    // Cleanup: Component unmount olduğunda isteği iptal et
    return () => {
      if (abortControllerRef.current) {
        console.log("🛑 [useEffect] Component unmount, istek iptal ediliyor");
        abortControllerRef.current.abort();
      }
    };
  }, [currentUserId]);

  // Test fonksiyonu
  const handleTest = async () => {
    console.log("🧪 Test butonu tıklandı");
    try {
      const userId = await getActiveUUID();
      const response = await fetch(
        `${GET_PRODUCTS_ENDPOINT}?user_id=${userId}`
      );
      const data = await response.json();
      alert("API Test: " + JSON.stringify(data, null, 2));
    } catch (error) {
      alert("API Test Hatası: " + error.message);
    }
  };

  // Storage Debug fonksiyonu
  const handleStorageDebug = async () => {
    console.log("🔍 [Storage Debug] Başlatılıyor...");
    console.log(
      "🔍 [Storage Debug] Chrome API:",
      typeof chrome !== "undefined" && chrome.runtime.id && chrome.runtime.id
    );

    try {
      // Extension'dan storage bilgisi al
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime.id &&
        chrome.runtime.id
      ) {
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: "getActiveUUID" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log(
                  "❌ [Storage Debug] Extension mesaj hatası:",
                  chrome.runtime.lastError
                );
                reject(new Error("Extension bulunamadı"));
                return;
              }

              console.log(
                "🔍 [Storage Debug] Extension'dan aktif UUID:",
                response
              );
              resolve(response);
            }
          );
        });

        // localStorage'dan da oku
        const localUserId = localStorage.getItem("tum_listem_user_id");
        console.log("🔍 [Storage Debug] localStorage UUID:", localUserId);

        const debugInfo = {
          extension: response,
          localStorage: localUserId,
          currentUserId: currentUserId,
          uuidType: uuidType,
          isLoggedIn: isLoggedIn,
          hasExtension: true,
          extensionId: chrome.runtime.id,
        };

        console.log("🔍 [Storage Debug] Tüm bilgiler:", debugInfo);
        alert("Storage Debug: " + JSON.stringify(debugInfo, null, 2));
      } else {
        // Extension yok, sadece localStorage kontrol et
        const localUserId = localStorage.getItem("tum_listem_user_id");
        const debugInfo = {
          extension: null,
          localStorage: localUserId,
          currentUserId: currentUserId,
          uuidType: uuidType,
          isLoggedIn: isLoggedIn,
          hasExtension: false,
        };

        console.log(
          "🔍 [Storage Debug] Extension yok, localStorage:",
          debugInfo
        );
        alert(
          "Storage Debug (Extension yok): " + JSON.stringify(debugInfo, null, 2)
        );
      }
    } catch (error) {
      console.error("🔍 [Storage Debug] Hata:", error);
      alert("Storage Debug Hatası: " + error.message);
    }
  };

  // URL'den ürün ID'sini al
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("product");

    if (productId && products.length > 0) {
      const product = products.find((p) => p.id == productId);
      if (product) {
        setSelectedProduct(product);
        updateMetaTags(product);
      }
    }
  }, [products]);

  // Meta tag'leri güncelle
  const updateMetaTags = (product) => {
    // Open Graph meta tag'leri
    const metaTags = {
      "og:title": `${product.name} - Heybe`,
      "og:description": `${product.name} ürünü ${product.site} sitesinde ${
        product.price || "fiyat belirtilmemiş"
      } fiyatla satılıyor.`,
      "og:image": product.image_url || "https://my-heybe.vercel.app/logo.svg",
      "og:url": window.location.href,
      "og:type": "product",
      "og:site_name": "Heybe",
      "twitter:title": `${product.name} - Heybe`,
      "twitter:description": `${product.name} ürünü ${product.site} sitesinde satılıyor.`,
      "twitter:image":
        product.image_url || "https://my-heybe.vercel.app/logo.svg",
      "twitter:card": "summary_large_image",
    };

    // Meta tag'leri güncelle
    Object.entries(metaTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });

    // Sayfa başlığını güncelle
    document.title = `${product.name} - Heybe`;

    // Description meta tag'ini de güncelle
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute(
      "content",
      `${product.name} ürünü ${product.site} sitesinde ${
        product.price || "fiyat belirtilmemiş"
      } fiyatla satılıyor.`
    );

    console.log("✅ Meta tag'ler güncellendi:", metaTags);
  };

  // API'den ürünleri çek
  const fetchProducts = async () => {
    console.log("🚀 [fetchProducts] Başladı");

    // Eğer userId yoksa extension kontrolü yap
    if (!currentUserId) {
      console.log(
        "⏳ [fetchProducts] userId yok, extension kontrol ediliyor..."
      );
      return;
    }

    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      console.log("🛑 [fetchProducts] Önceki istek iptal ediliyor...");
      abortControllerRef.current.abort();
    }

    // Yeni AbortController oluştur
    abortControllerRef.current = new AbortController();

    try {
      setStatus("loading");
      console.log("🚀 [fetchProducts] userId:", currentUserId);

      const url = `${GET_PRODUCTS_ENDPOINT}?user_id=${currentUserId}`;
      console.log("🚀 [fetchProducts] API URL:", url);

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      console.log("🚀 [fetchProducts] Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("🚀 [fetchProducts] Response data:", data);
        setProducts(data.products || []);
        setFilteredProducts(data.products || []); // Başlangıçta tüm ürünler
        setStatus("success");
      } else {
        console.log("❌ [fetchProducts] Response not ok:", response.status);
        setError("Ürünler yüklenirken hata oluştu");
        setStatus("error");
      }
    } catch (error) {
      // AbortError ise iptal edilmiş demektir, hata gösterme
      if (error.name === "AbortError") {
        console.log("🛑 [fetchProducts] İstek iptal edildi");
        return;
      }
      console.error("❌ [fetchProducts] Error:", error);
      setError("Network hatası");
      setStatus("error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${DELETE_PRODUCT_ENDPOINT}?product_id=${productId}&user_id=${currentUserId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ Ürün silindi:", productId);
        // Ürünü local state den kaldır
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
        setFilteredProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );

        // Başarı mesajı göster
        alert("✅ Ürün başarıyla silindi!");
      } else {
        setError("Ürün silinirken hata oluştu");
      }
    } catch (error) {
      console.error("❌ Silme hatası:", error);
      setError("Silme hatası: " + error.message);
    } finally {
      setDeletingProductId(null);
      setIsDeleting(false);
    }
  };
  // Tümünü sil
  const handleClearAll = async () => {
    if (!currentUserId) {
      alert("Kullanıcı ID bulunamadı. Lütfen sayfayı yenileyin.");
      return;
    }

    if (
      !confirm(
        `Mevcut kullanıcının (${currentUserId}) tüm ürünlerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`
      )
    ) {
      return;
    }

    try {
      setIsClearingAll(true);
      console.log(
        "🗑️ [handleClearAll] Kullanıcının tüm ürünleri siliniyor:",
        currentUserId
      );

      // Sadece mevcut kullanıcının ürünlerini sil
      const userProducts = products.filter(
        (product) => product.user_id === currentUserId
      );

      if (userProducts.length === 0) {
        alert("Silinecek ürün bulunamadı.");
        return;
      }

      // Tek bir API çağrısı ile tüm ürünleri sil
      const response = await fetch(
        `${DELETE_ALL_PRODUCTS_ENDPOINT}?user_id=${currentUserId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        `✅ ${result.deletedCount} ürün silindi (kullanıcı: ${currentUserId})`
      );
      fetchProducts();
    } catch (error) {
      console.error("❌ Toplu silme hatası:", error);
      setError("Toplu silme hatası: " + error.message);
    } finally {
      setIsClearingAll(false);
    }
  };

  // Ürün linkini aç
  const handleOpenProduct = (product) => {
    if (product.url) {
      window.open(product.url, "_blank");
    } else {
      console.error("❌ [handleOpenProduct] Ürün URL'i bulunamadı:", product);
    }
  };

  // Minimal istatistikler
  const calculateStats = () => {
    const totalProducts = products.length;
    const uniqueSites = [...new Set(products.map((p) => p.site))].length;
    return { totalProducts, uniqueSites };
  };

  const stats = calculateStats();

  // Login fonksiyonu
  const handleLogin = async (email, password) => {
    try {
      console.log("🔐 [Website] Giriş yapılıyor:", email);

      // Eski misafir UUID'yi al (transfer için - Madde 1, 3)
      const oldData = await storageHelper.getCurrentUUID();

      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          guest_user_id: oldData?.uuid || currentUserId, // Eski UUID'yi gönder
          role: oldData?.role || "GUEST", // Role bilgisini gönder (Madde 1, 3)
        }),
      });

      const result = await response.json();

      if (response.ok && result.uuid) {
        console.log("✅ [Website] Giriş başarılı:", result);

        // Transfer için eski UUID'yi kullan (zaten yukarıda alındı)
        const oldUuid = oldData?.uuid;

        // Yeni USER UUID'yi kaydet (Madde 4, 9, 11)
        await storageHelper.setUserUUID(result.uuid);

        // Misafir ürünleri transfer et (Madde 9)
        if (oldUuid && oldData?.role === "GUEST") {
          console.log(
            `🔄 [Website] Misafir ürünleri transfer ediliyor: ${oldUuid} → ${result.uuid}`
          );
          await storageHelper.transferGuestProducts(oldUuid, result.uuid);
        }

        // State'i güncelle
        setCurrentUserId(result.uuid);
        setUuidType("permanent");
        setIsLoggedIn(true);

        // Ürünleri yeniden yükle
        await fetchProducts();

        return { success: true, message: "Giriş başarılı!" };
      } else {
        console.log("❌ [Website] Giriş başarısız:", result);
        return { success: false, message: result.error || "Giriş başarısız" };
      }
    } catch (error) {
      console.error("❌ [Website] Giriş hatası:", error);
      return { success: false, message: "Bağlantı hatası" };
    }
  };

  // Register fonksiyonu
  const handleRegister = async (email, password, name) => {
    try {
      console.log("📝 [Website] Kayıt yapılıyor:", email);

      // Eski misafir UUID'yi al (transfer için - Madde 2, 3)
      const oldData = await storageHelper.getCurrentUUID();

      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          guest_user_id: oldData?.uuid || currentUserId, // Eski UUID'yi gönder
          role: oldData?.role || "GUEST", // Role bilgisini gönder (Madde 2, 3)
        }),
      });

      const result = await response.json();

      if (response.ok && result.uuid) {
        console.log("✅ [Website] Kayıt başarılı:", result);

        // Transfer için eski UUID'yi kullan (zaten yukarıda alındı)
        const oldUuid = oldData?.uuid;

        // Yeni USER UUID'yi kaydet (Madde 4, 10, 11)
        await storageHelper.setUserUUID(result.uuid);

        // Misafir ürünleri transfer et (Madde 10)
        if (oldUuid && oldData?.role === "GUEST") {
          console.log(
            `🔄 [Website] Misafir ürünleri transfer ediliyor: ${oldUuid} → ${result.uuid}`
          );
          await storageHelper.transferGuestProducts(oldUuid, result.uuid);
        }

        // State'i güncelle
        setCurrentUserId(result.uuid);
        setUuidType("permanent");
        setIsLoggedIn(true);

        // Ürünleri yeniden yükle
        await fetchProducts();

        return { success: true, message: "Kayıt başarılı!" };
      } else {
        console.log("❌ [Website] Kayıt başarısız:", result);
        return { success: false, message: result.error || "Kayıt başarısız" };
      }
    } catch (error) {
      console.error("❌ [Website] Kayıt hatası:", error);
      return { success: false, message: "Bağlantı hatası" };
    }
  };

  // Logout fonksiyonu (Madde 7, 14, 15, 16)
  const handleLogout = async () => {
    try {
      console.log("🚪 [Website] Çıkış yapılıyor");

      // SimpleStorage logout (temizle + yeni misafir UUID) (Madde 7, 14, 15, 16)
      const newGuestData = await storageHelper.logout();

      // State'i sıfırla
      setProducts([]);
      setFilteredProducts([]);

      if (newGuestData) {
        // Extension varsa yeni misafir UUID setlendi (Madde 7, 14, 16)
        setCurrentUserId(newGuestData.uuid);
        setUuidType("guest");
        setIsLoggedIn(false);
        console.log(
          "✅ [Website] Çıkış sonrası misafir UUID:",
          newGuestData.uuid
        );
      } else {
        // Extension yoksa sadece temizleme (Madde 15)
        setCurrentUserId(null);
        setUuidType(null);
        setIsLoggedIn(false);
        console.log("✅ [Website] Çıkış tamamlandı (extension yok)");
      }

      return { success: true, message: "Çıkış yapıldı" };
    } catch (error) {
      console.error("❌ [Website] Çıkış hatası:", error);
      return { success: false, message: "Çıkış hatası" };
    }
  };

  // Aktif UUID'yi al - SimpleStorage (16 maddelik akış)
  async function getActiveUUID() {
    // Eğer zaten UUID varsa, onu kullan (değiştirme!)
    if (currentUserId) {
      console.log(
        "🔄 [getActiveUUID] Mevcut UUID kullanılıyor:",
        currentUserId
      );
      return currentUserId;
    }

    // Eğer zaten çalışıyorsa bekle
    if (isGettingUserId) {
      console.log("⏳ [getActiveUUID] Zaten çalışıyor, bekleniyor...");
      while (isGettingUserId) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return currentUserId;
    }

    console.log("🚀 [getActiveUUID] Fonksiyon başladı");
    setIsGettingUserId(true);

    try {
      // SimpleStorage ile UUID al (Madde 3, 12, 13)
      const uuidData = await storageHelper.getCurrentUUID();

      if (uuidData) {
        console.log("✅ [getActiveUUID] UUID alındı:", uuidData);
        setCurrentUserId(uuidData.uuid);
        setUuidType(uuidData.role === "USER" ? "permanent" : "guest");
        setIsLoggedIn(uuidData.role === "USER");
        setIsGettingUserId(false);
        return uuidData.uuid;
      } else {
        console.log("❌ [getActiveUUID] UUID alınamadı");
        setIsGettingUserId(false);
        return null;
      }
    } catch (error) {
      console.error("❌ [getActiveUUID] Hata:", error);
      setIsGettingUserId(false);
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <Sidebar
        onToggle={handleSidebarToggle}
        currentUserId={currentUserId}
        userRole={userRole}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onRegister={handleRegister}
        currentLanguage={currentLanguage}
        onLanguageChange={changeLanguage}
        t={t}
        onLogout={handleLogout}
        checkExtensionAvailability={checkExtensionAvailability}
      />

      {/* Main Content - Sidebar için dinamik margin */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          {/* Status Bar */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center gap-4">
                <span>
                  {status === "error" ? "N/A" : stats.totalProducts}{" "}
                  {t("productsCount")}
                </span>
                <span>•</span>
                <span>
                  {status === "error" ? "N/A" : stats.uniqueSites}{" "}
                  {t("sitesCount")}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {t("lastUpdate")} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Uyarı Mesajı */}
          {showWarning && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      {t("warning")}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarning(false)}
                  className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800 transition-colors p-1 rounded-full hover:bg-yellow-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Extension Uyarısı */}
          {showExtensionWarning && (
            <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 pr-12">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    {t("extensionNotFoundWarning")}
                  </h3>
                </div>
                <div className="ml-4 mr-4">
                  <button
                    onClick={() => {
                      const installSection = document.getElementById("install");
                      if (installSection) {
                        installSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                  >
                    {t("installExtension")}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowExtensionWarning(false);
                    setExtensionWarningDismissed(true);
                  }}
                  className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Arama Kutusu ve Tümünü Sil - Sadece ürün varsa göster */}
          {products.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Arama Kutusu - Sol */}
                <div className="w-80">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      {filteredProducts.length} ürün bulundu
                    </p>
                  )}
                </div>

                {/* Tümünü Sil Butonu - Sağ */}
                <div className="flex-shrink-0">
                  <button
                    onClick={handleClearAll}
                    className="bg-red-500/80 hover:bg-red-600/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Tümünü Sil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === "loading" ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">{t("loading")}</p>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-8">
              <p className="text-red-500">❌ {error}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? currentLanguage === "tr"
                    ? "Arama sonucu bulunamadı"
                    : "No search results found"
                  : t("noProductsYet")}
              </p>
            </div>
          ) : (
            <div id="products" className="space-y-3 mb-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteProduct}
                  isDeleting={deletingProductId === product.id}
                  onOpenProduct={handleOpenProduct}
                />
              ))}
            </div>
          )}

          {/* Ürün Detay Sayfası */}
          {selectedProduct && renderProductDetail()}

          {/* Kurulum Talimatları Section */}
          <div id="install" className="mb-8">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                📋 {t("installInstructions")}
              </h3>

              {/* Browser Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveInstallTab("chrome")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeInstallTab === "chrome"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Chrome / Brave
                  </button>
                  <button
                    onClick={() => setActiveInstallTab("safari")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeInstallTab === "safari"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Safari
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-4 text-sm">
                {activeInstallTab === "chrome" && (
                  <div>
                    <div className="mb-4">
                      <h5 className="font-medium text-blue-600 text-lg">
                        {t("chromeInstall")}
                      </h5>
                    </div>

                    <ol className="list-decimal list-inside ml-2 space-y-2">
                      <li className="flex items-center gap-2">
                        <span>{t("downloadExtension")}</span>
                        <button
                          onClick={() =>
                            window.open(
                              "https://drive.google.com/file/d/1bqPwzoUleB16plc97ALNqtfpZiPL1vIu/view?usp=drive_link",
                              "_blank"
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <img
                            src="/images/google-drive.png"
                            alt="Google Drive"
                            className="w-3 h-3"
                          />
                          {t("chromeDownload")}
                        </button>
                      </li>
                      <li>{t("step1Chrome")}</li>
                      <li>{t("step2Chrome")}</li>
                      <li>{t("step3Chrome")}</li>
                      <li>{t("step4Chrome")}</li>
                      <li>{t("step5Chrome")}</li>
                    </ol>
                  </div>
                )}

                {activeInstallTab === "safari" && (
                  <div>
                    <div className="mb-4">
                      <h5 className="font-medium text-blue-600 text-lg">
                        {t("safariInstall")}
                      </h5>
                    </div>

                    <ol className="list-decimal list-inside ml-2 space-y-2">
                      <li className="flex items-center gap-2">
                        <span>{t("downloadExtension")}</span>
                        <button
                          onClick={() =>
                            window.open(
                              "https://drive.google.com/file/d/1MsRfPKFm1KArdO0tdGIys4z0BpjQuX05/view?usp=drive_link",
                              "_blank"
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <img
                            src="/images/google-drive.png"
                            alt="Google Drive"
                            className="w-3 h-3"
                          />
                          {t("safariDownload")}
                        </button>
                      </li>
                      <li>
                        {t("step1Safari")}
                        <div className="ml-4 mt-1 text-xs text-gray-600">
                          (Sol üst köşedeki Safari menüsü)
                        </div>
                      </li>
                      <li>{t("step2Safari")}</li>
                      <li>{t("step3Safari")}</li>
                      <li>{t("step4Safari")}</li>
                      <li>{t("step5Safari")}</li>
                      <li>{t("step6Safari")}</li>
                      <li>{t("step7Safari")}</li>
                    </ol>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-xs">
                        <strong>
                          💡 Safari {currentLanguage === "tr" ? "Notu" : "Note"}
                          :
                        </strong>{" "}
                        {t("safariNote")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Kurulum Sonrası Kullanım Kılavuzu */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h6 className="font-medium text-blue-800 mb-3">
                    🎯 {t("usageGuide")}
                  </h6>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>
                          {currentLanguage === "tr" ? "Adım" : "Step"} 1:
                        </strong>{" "}
                        {t("usageStep1")}
                      </p>
                      <img
                        src="/images/guide-1.png"
                        alt="E-ticaret sitesi örneği"
                        className="w-full max-w-md rounded border shadow-sm"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>
                          {currentLanguage === "tr" ? "Adım" : "Step"} 2:
                        </strong>{" "}
                        {t("usageStep2")}
                      </p>
                      <img
                        src="/images/guide-2.png"
                        alt="Heybeye Ekle butonu örneği"
                        className="w-full max-w-md rounded border shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teknik Bilgiler Section - Sadece geliştirici için görünür */}
          {(currentUserId === "sayacienes@gmail.com" ||
            localStorage.getItem("currentUserId") ===
              "sayacienes@gmail.com") && (
            <div id="technical" className="mb-8">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🔧 {t("developerInfo")}
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-600 mb-2">
                        Extension Detayları:
                      </h5>
                      <ul className="space-y-1 text-gray-600">
                        <li>
                          <strong>Extension ID:</strong> my-list-sepet-extension
                        </li>
                        <li>
                          <strong>Manifest Version:</strong> 3
                        </li>
                        <li>
                          <strong>Permissions:</strong> scripting, activeTab
                        </li>
                        <li>
                          <strong>Content Scripts:</strong> Tüm URL'lerde
                          çalışır
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-green-600 mb-2">
                        Teknik Altyapı:
                      </h5>
                      <ul className="space-y-1 text-gray-600">
                        <li>
                          <strong>API Endpoint:</strong> Vercel + Neon
                          PostgreSQL
                        </li>
                        <li>
                          <strong>Frontend:</strong> React + TailwindCSS +
                          Shadcn
                        </li>
                        <li>
                          <strong>Browser Support:</strong> Chrome, Brave
                        </li>
                        <li>
                          <strong>Deployment:</strong> Vercel
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-700 mb-2">
                      🔧 Geliştirici Notları:
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Extension Manifest V3 kullanıyor</li>
                      <li>• Content script tüm sitelerde çalışıyor</li>
                      <li>• Ürün bilgileri PostgreSQL'de saklanıyor</li>
                      <li>• API serverless functions ile çalışıyor</li>
                      <li>• Frontend Vercel'de host ediliyor</li>
                    </ul>
                  </div>

                  {/* Debug Butonları - Geliştirici section'ında */}
                  <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <h5 className="font-medium text-red-700 mb-3 text-lg">
                      🛠️ DEBUG ARAÇLARI (Geliştirici İçin):
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleDebug}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        🔧 Debug
                      </button>
                      <button
                        onClick={handleRefresh}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        🔄 {t("refresh")}
                      </button>
                      <button
                        onClick={handleTest}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        🧪 {t("test")}
                      </button>
                      <button
                        onClick={handleStorageDebug}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        💾 {t("storageDebug")}
                      </button>
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      {currentLanguage === "tr"
                        ? "Bu butonlar sadece geliştirme amaçlıdır. Normal kullanıcılar için gizlidir."
                        : "These buttons are for development purposes only. They are hidden from normal users."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {(isClearingAll || isDeleting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">
              {isClearingAll ? "Tüm ürünler siliniyor..." : "Ürün siliniyor..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
