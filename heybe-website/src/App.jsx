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

  // AbortController için ref
  const abortControllerRef = React.useRef(null);

  // Cross-browser storage helper
  const storageHelper = new SimpleStorageHelper();

  // Extension kontrol fonksiyonu
  const checkExtensionAvailability = async () => {
    try {
      // Chrome extension kontrolü
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime.id &&
        chrome.runtime.id
      ) {
        // Extension'a test mesajı gönder
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.id.sendMessage({ action: "test" }, (response) => {
            if (chrome.runtime.id.lastError) {
              reject(new Error("Extension yanıt vermiyor"));
            } else {
              resolve(response);
            }
          });
        });
        return { available: true, type: "chrome" };
      }

      // Firefox extension kontrolü
      if (
        typeof browser !== "undefined" &&
        browser.runtime &&
        browser.runtime.id
      ) {
        return { available: true, type: "firefox" };
      }

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
          console.log("⚠️ [useEffect] UUID alınamadı, ürünler çekilemiyor");
          setStatus("no-extension");
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
          chrome.runtime.id &&
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
          chrome.runtime.id.sendMessage(
            { action: "getActiveUUID" },
            (response) => {
              if (chrome.runtime.id.lastError) {
                console.log(
                  "❌ [Storage Debug] Extension mesaj hatası:",
                  chrome.runtime.id.lastError
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
      const response = await fetch(DELETE_PRODUCT_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId, user_id: currentUserId }),
      });

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
                  {status === "error" ? "N/A" : stats.totalProducts} ürün
                </span>
                <span>•</span>
                <span>
                  {status === "error" ? "N/A" : stats.uniqueSites} farklı site
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleTimeString()}
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
                      Dikkat! Bazı bilgiler kaynak siteyi tarama sırasında
                      yanlış alınabilir.
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

          {/* Arama Kutusu ve Tümünü Sil - Sadece ürün varsa göster */}
          {products.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Arama Kutusu - Sol */}
                <div className="w-80">
                  <input
                    type="text"
                    placeholder="Ürün adı, site adı veya fiyat ile ara..."
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
              <p className="text-gray-500 mt-2">Ürünler yükleniyor...</p>
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
                {searchTerm ? "Arama sonucu bulunamadı" : "Henüz ürün yok"}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Kurulum Talimatları
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-600">Chrome/Brave:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>
                      Extension dosyalarını indirin{" "}
                      <button
                        onClick={() =>
                          window.open(
                            "https://drive.google.com/file/d/1od3THFjoZpTJW7il8GBNQwEkUK4Wvb3S/view?usp=sharing",
                            "_blank"
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2 flex items-center gap-1"
                      >
                        <img
                          src="/images/google-drive.png"
                          alt="Google Drive"
                          className="w-3 h-3"
                        />
                        İndir
                      </button>
                    </li>
                    <li>
                      Chrome'da{" "}
                      <code className="bg-gray-200 px-1 rounded">
                        chrome://extensions/
                      </code>{" "}
                      adresine gidin
                    </li>
                    <li>"Developer mode"u açın</li>
                    <li>"Load unpacked" butonuna tıklayın</li>
                    <li>İndirdiğiniz klasörü seçin</li>
                  </ol>

                  {/* Kurulum Sonrası Kullanım Kılavuzu */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h6 className="font-medium text-blue-800 mb-3">
                      🎯 Kurulum Sonrası Kullanım Kılavuzu
                    </h6>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-blue-700 mb-2">
                          <strong>Adım 1:</strong> Herhangi bir e-ticaret
                          sitesine gidin
                        </p>
                        <img
                          src="/images/guide-1.png"
                          alt="E-ticaret sitesi örneği"
                          className="w-full max-w-md rounded border shadow-sm"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 mb-2">
                          <strong>Adım 2:</strong> Ürün sayfasında "Heybeye
                          Ekle" butonunu görürsünüz
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

                {/* Firefox ve Safari desteği şimdilik gizli
                <div>
                  <h5 className="font-medium text-orange-600">Firefox:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>
                      Extension dosyalarını indirin{" "}
                      <button
                        onClick={() => {
                          try {
                            const link = document.createElement("a");
                            link.href = "/extension-files.zip";
                            link.download = "my-list-sepet-extension.zip";
                            link.target = "_blank";
                            link.onerror = () => {
                              alert(
                                "Dosya indirme başarısız. Lütfen manuel kurulum talimatlarını takip edin."
                              );
                            };
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            console.log(
                              "📦 Extension dosyaları indiriliyor..."
                            );
                          } catch (error) {
                            console.error("❌ Dosya indirme hatası:", error);
                            alert(
                              "Dosya indirme başarısız. Lütfen manuel kurulum talimatlarını takip edin."
                            );
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2"
                      >
                        İndir
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            "https://drive.google.com/file/d/1od3THFjoZpTJW7il8GBNQwEkUK4Wvb3S/view?usp=sharing",
                            "_blank"
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2 flex items-center gap-1"
                      >
                        <img src="/images/google-drive.png" alt="Google Drive" className="w-3 h-3" />
                        İndir
                      </button>
                    </li>
                    <li>
                      Firefox'ta{" "}
                      <code className="bg-gray-200 px-1 rounded">
                        about:debugging
                      </code>{" "}
                      adresine gidin
                    </li>
                    <li>"This Firefox" sekmesine tıklayın</li>
                    <li>"Load Temporary Add-on" butonuna tıklayın</li>
                    <li>
                      İndirdiğiniz <code>manifest.json</code> dosyasını seçin
                    </li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-green-600">Safari:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>
                      Extension dosyalarını indirin{" "}
                      <button
                        onClick={() => {
                          try {
                            const link = document.createElement("a");
                            link.href = "/extension-files.zip";
                            link.download = "my-list-sepet-extension.zip";
                            link.target = "_blank";
                            link.onerror = () => {
                              alert(
                                "Dosya indirme başarısız. Lütfen manuel kurulum talimatlarını takip edin."
                              );
                            };
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            console.log(
                              "📦 Extension dosyaları indiriliyor..."
                            );
                          } catch (error) {
                            console.error("❌ Dosya indirme hatası:", error);
                            alert(
                              "Dosya indirme başarısız. Lütfen manuel kurulum talimatlarını takip edin."
                            );
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2"
                      >
                        İndir
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            "https://drive.google.com/file/d/1od3THFjoZpTJW7il8GBNQwEkUK4Wvb3S/view?usp=sharing",
                            "_blank"
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2 flex items-center gap-1"
                      >
                        <img src="/images/google-drive.png" alt="Google Drive" className="w-3 h-3" />
                        İndir
                      </button>
                    </li>
                    <li>Safari'de "Develop" menüsünü açın</li>
                    <li>"Show Extension Builder" seçin</li>
                    <li>"+" butonuna tıklayın</li>
                    <li>"Add Extension" seçin</li>
                    <li>İndirdiğiniz klasörü seçin</li>
                  </ol>
                </div>
                */}
              </div>
            </div>
          </div>

          {/* Kaldırma Talimatları Section */}
          <div id="uninstall" className="mb-8">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🗑️ Kaldırma Talimatları
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-600">Chrome/Brave:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>
                      Chrome'da{" "}
                      <code className="bg-gray-200 px-1 rounded">
                        chrome://extensions/
                      </code>{" "}
                      adresine gidin
                    </li>
                    <li>"Heybe Extension"ı bulun</li>
                    <li>"Remove" butonuna tıklayın</li>
                    <li>Onay penceresinde "Remove" seçin</li>
                  </ol>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-xs">
                    <strong>Not:</strong> Extension kaldırıldıktan sonra
                    kaydedilen ürünler veritabanında kalır. Tamamen silmek için
                    web sayfasından ürünleri tek tek silebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Teknik Bilgiler Section - En alta - Herkes için görünür */}
          {true && (
            <div id="technical" className="mb-8">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🔧 Geliştirici Bilgileri
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
                        🔄 Yenile
                      </button>
                      <button
                        onClick={handleTest}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        🧪 Test
                      </button>
                      <button
                        onClick={handleStorageDebug}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        💾 Storage Debug
                      </button>
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      Bu butonlar sadece geliştirme amaçlıdır. Normal
                      kullanıcılar için gizlidir.
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
