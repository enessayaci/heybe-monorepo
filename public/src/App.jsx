import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProductCard from "./components/ProductCard";
import StatsCard from "./components/StatsCard";
import Sidebar from "./components/Sidebar";

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
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // API endpoint'leri - Vercel + Neon DB
  const API_BASE = "https://my-list-pi.vercel.app/api";
  const GET_PRODUCTS_ENDPOINT = `${API_BASE}/get-products`;
  const DELETE_PRODUCT_ENDPOINT = `${API_BASE}/delete-product`;
  const ADD_PRODUCT_ENDPOINT = `${API_BASE}/add-product`;

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
        await getUserId(); // UUID hazırla / IndexedDB hazır
        await fetchProducts();
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

      setCurrentUserId(uuid);
      setUuidType(type);

      // Guest kullanıcı ise uyarı göster
      if (type === "guest") {
        setShowGuestWarning(true);
      }

      console.log("✅ [Event] Aktif UUID set edildi:", { uuid, type });
    };

    // Extension'dan login status event'ini dinle
    const handleExtensionLoginStatus = (event) => {
      console.log(
        "📨 [Web Site] extensionLoginStatusChanged event alındı:",
        event.detail
      );

      setIsLoggedIn(event.detail.isLoggedIn);

      // Giriş yapıldıysa guest uyarısını kapat
      if (event.detail.isLoggedIn) {
        setShowGuestWarning(false);
      }
    };

    // Extension'dan permanent UUID isteği dinle
    const handleExtensionPermanentUUIDRequest = (event) => {
      console.log("📨 [Web Site] Extension'dan permanent UUID isteği alındı");

      // Eğer kullanıcı giriş yapmışsa permanent UUID'yi extension'a gönder
      if (isLoggedIn && currentUserId && uuidType === "permanent") {
        console.log(
          "✅ [Web Site] Permanent UUID extension'a gönderiliyor:",
          currentUserId
        );

        // Extension'a permanent UUID'yi gönder
        window.postMessage(
          {
            type: "SEND_PERMANENT_UUID",
            uuid: currentUserId,
            source: "web-site",
          },
          "*"
        );
      } else {
        console.log(
          "⚠️ [Web Site] Kullanıcı giriş yapmamış, permanent UUID yok"
        );
      }
    };

    window.addEventListener(
      "extensionActiveUUIDSet",
      handleExtensionActiveUUID
    );
    window.addEventListener(
      "extensionLoginStatusChanged",
      handleExtensionLoginStatus
    );
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
            chrome.runtime &&
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
        "extensionLoginStatusChanged",
        handleExtensionLoginStatus
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
      // currentUserId yoksa extension kontrolü yap
      const hasExtension =
        typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;
      if (!hasExtension) {
        console.log("❌ [useEffect] Extension kurulu değil");
        setStatus("no-extension");
      }
    }
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
      typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id
    );

    try {
      // Extension'dan storage bilgisi al
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
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
      "og:title": `${product.name} - Tüm Listem`,
      "og:description": `${product.name} ürünü ${product.site} sitesinde ${
        product.price || "fiyat belirtilmemiş"
      } fiyatla satılıyor.`,
      "og:image": product.image_url || "https://my-list-pi.vercel.app/logo.svg",
      "og:url": window.location.href,
      "og:type": "product",
      "og:site_name": "Tüm Listem",
      "twitter:title": `${product.name} - Tüm Listem`,
      "twitter:description": `${product.name} ürünü ${product.site} sitesinde satılıyor.`,
      "twitter:image":
        product.image_url || "https://my-list-pi.vercel.app/logo.svg",
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
    document.title = `${product.name} - Tüm Listem`;

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

      // Extension kurulu mu kontrol et
      const hasExtension =
        typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;

      if (!hasExtension) {
        console.log("❌ [fetchProducts] Extension kurulu değil");
        setStatus("no-extension");
        return;
      }

      // Extension var ama UUID yoksa bekle
      console.log("⏳ [fetchProducts] Extension var, UUID bekleniyor...");
      return;
    }

    try {
      setStatus("loading");
      console.log("🚀 [fetchProducts] userId:", currentUserId);

      const url = `${GET_PRODUCTS_ENDPOINT}?user_id=${currentUserId}`;
      console.log("🚀 [fetchProducts] API URL:", url);

      const response = await fetch(url);
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
      console.error("❌ [fetchProducts] Error:", error);
      setError("Network hatası");
      setStatus("error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
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

      for (const product of userProducts) {
        await fetch(DELETE_PRODUCT_ENDPOINT, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
            user_id: currentUserId,
          }),
        });
      }

      console.log(
        `✅ ${userProducts.length} ürün silindi (kullanıcı: ${currentUserId})`
      );
      fetchProducts();
    } catch (error) {
      console.error("❌ Toplu silme hatası:", error);
      setError("Toplu silme hatası: " + error.message);
    }
  };

  // Ürün linkini aç
  const handleOpenProduct = (product) => {
    window.open(product.product_url, "_blank");
  };

  // Minimal istatistikler
  const calculateStats = () => {
    const totalProducts = products.length;
    const uniqueSites = [...new Set(products.map((p) => p.site))].length;
    return { totalProducts, uniqueSites };
  };

  const stats = calculateStats();

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

  // Aktif UUID'yi al veya oluştur - Chrome Extension Storage API
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
      let uuidData = null;

      // 1. Extension'dan aktif UUID'yi al (Chrome Storage API)
      let extensionUUIDReceived = false; // Extension'dan UUID alındı mı?

      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.id
      ) {
        console.log("🔍 [Web Site] Extension mevcut, aktif UUID isteniyor...");
        console.log("🔍 [Web Site] Extension ID:", chrome.runtime.id);

        try {
          const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { action: "getActiveUUID" },
              (response) => {
                console.log("🔍 [Web Site] Extension response:", response);
                console.log(
                  "🔍 [Web Site] Chrome runtime error:",
                  chrome.runtime.lastError
                );

                if (chrome.runtime.lastError) {
                  console.log(
                    "❌ [Web Site] Extension mesaj hatası:",
                    chrome.runtime.lastError
                  );
                  reject(new Error("Extension bulunamadı"));
                  return;
                }

                if (response && response.uuid) {
                  console.log(
                    "✅ [Web Site] Extension'dan aktif UUID alındı:",
                    response
                  );
                  extensionUUIDReceived = true; // Extension'dan UUID alındı!
                  resolve(response);
                } else {
                  console.log("❌ [Web Site] Extension'dan UUID alınamadı");
                  reject(new Error("UUID bulunamadı"));
                }
              }
            );
          });

          uuidData = response;
        } catch (error) {
          console.log(
            "❌ [Web Site] Extension mesajlaşma hatası:",
            error.message
          );
        }
      }

      // 2. Extension'dan UUID alınmadıysa localStorage'a bak
      if (!extensionUUIDReceived && (!uuidData || !uuidData.uuid)) {
        console.log(
          "⚠️ [Web Site] Extension'dan UUID alınamadı, localStorage kontrol ediliyor..."
        );
        const backupUserId = localStorage.getItem("tum_listem_user_id");
        if (backupUserId) {
          console.log(
            "🔄 [Web Site] Fallback: localStorage'dan UUID okundu:",
            backupUserId
          );
          uuidData = { uuid: backupUserId, type: "guest" };
        }
      }

      // 3. Hiç UUID yoksa extension kontrolü yap
      if (!uuidData || !uuidData.uuid) {
        // Extension kurulu mu kontrol et
        const hasExtension =
          typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;

        if (!hasExtension) {
          console.log(
            "❌ [Web Site] Extension kurulu değil, UUID oluşturulamıyor"
          );
          setIsGettingUserId(false);
          return null; // Extension yoksa null döndür
        }

        const newUUID = generateUUID();
        console.log("👤 [Web Site] Yeni Guest UUID oluşturuldu:", newUUID);

        // Extension varsa oraya da yaz
        if (hasExtension) {
          try {
            await new Promise((resolve, reject) => {
              chrome.runtime.sendMessage(
                {
                  action: "setGuestUUID",
                  uuid: newUUID,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.log(
                      "❌ [Web Site] Extension mesaj hatası:",
                      chrome.runtime.lastError
                    );
                    reject(new Error("Extension bulunamadı"));
                    return;
                  }

                  if (response && response.success) {
                    console.log(
                      "✅ [Web Site] Guest UUID extension'a yazıldı:",
                      newUUID
                    );
                    resolve(true);
                  } else {
                    console.log(
                      "❌ [Web Site] Guest UUID extension'a yazılamadı"
                    );
                    reject(new Error("UUID kaydedilemedi"));
                  }
                }
              );
            });
          } catch (error) {
            console.log(
              "❌ [Web Site] Extension'a yazma hatası:",
              error.message
            );
          }
        }

        // localStorage'a da yaz (sadece extension yoksa)
        if (!hasExtension) {
          localStorage.setItem("tum_listem_user_id", newUUID);
          console.log(
            "✅ [Web Site] Guest UUID localStorage'a yazıldı (extension yok):",
            newUUID
          );
        } else {
          console.log(
            "⚠️ [Web Site] Extension mevcut, localStorage'a yazılmadı:",
            newUUID
          );
        }

        uuidData = { uuid: newUUID, type: "guest" };
      }

      setCurrentUserId(uuidData.uuid);
      setUuidType(uuidData.type);

      // Guest kullanıcı ise uyarı göster
      if (uuidData.type === "guest") {
        setShowGuestWarning(true);
      }

      setIsGettingUserId(false);
      return uuidData.uuid;
    } catch (error) {
      console.error("❌ [getActiveUUID] Hata:", error);
      setIsGettingUserId(false);
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Guest Warning Modal */}
      {showGuestWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Misafir Kullanıcı
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Henüz giriş yapmadınız. Ürünleriniz geçici olarak saklanıyor ve
              kısıtlı özellikler mevcut. Kalıcı hesap oluşturmak için giriş
              yapın veya misafir olarak devam edin.
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setShowGuestWarning(false);
                  setShowLoginForm(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setShowGuestWarning(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Misafir Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Giriş Yap
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const email = formData.get("email");
                const password = formData.get("password");

                try {
                  // Extension'dan gelen UUID'yi kullan
                  if (window.EXTENSION_ACTIVE_UUID) {
                    console.log(
                      "✅ [Web Site] Extension UUID kullanılıyor:",
                      window.EXTENSION_ACTIVE_UUID
                    );
                    setCurrentUserId(window.EXTENSION_ACTIVE_UUID);
                    setUuidType("permanent");
                    setIsLoggedIn(true);
                    setShowLoginForm(false);
                    return;
                  }

                  // Extension yoksa normal API çağrısı
                  try {
                    const guestUserId = localStorage.getItem("guest_uuid");
                    const response = await fetch(
                      "https://my-list-pi.vercel.app/api/login",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          password,
                          guest_user_id: guestUserId || null,
                        }),
                      }
                    );

                    const result = await response.json();

                    if (response.ok && result.uuid) {
                      setCurrentUserId(result.uuid);
                      setUuidType("permanent");
                      setUserRole(result.role || "user");
                      setIsLoggedIn(true);
                      setShowLoginForm(false);
                      console.log(
                        "✅ [Web Site] Login başarılı:",
                        result.uuid,
                        "Role:",
                        result.role
                      );
                    } else {
                      alert(
                        "Giriş başarısız: " +
                          (result.error || "Bilinmeyen hata")
                      );
                    }
                  } catch (fetchError) {
                    console.error("❌ [Web Site] Fetch hatası:", fetchError);
                    alert("Bağlantı hatası");
                  }
                } catch (error) {
                  console.error("❌ [Web Site] Login hatası:", error);
                  alert("Bağlantı hatası");
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Şifrenizi girin"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Giriş Yap
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginForm(false);
                      setShowRegisterForm(true);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Kayıt Ol
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Form Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Kayıt Ol
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const email = formData.get("email");
                const password = formData.get("password");

                try {
                  // Extension'dan gelen UUID'yi kullan
                  if (window.EXTENSION_ACTIVE_UUID) {
                    console.log(
                      "✅ [Web Site] Extension UUID kullanılıyor:",
                      window.EXTENSION_ACTIVE_UUID
                    );
                    setCurrentUserId(window.EXTENSION_ACTIVE_UUID);
                    setUuidType("permanent");
                    setIsLoggedIn(true);
                    setShowRegisterForm(false);
                    return;
                  }

                  // Extension yoksa normal API çağrısı
                  try {
                    const guestUserId = localStorage.getItem("guest_uuid");
                    const response = await fetch(
                      "https://my-list-pi.vercel.app/api/register",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          password,
                          guest_user_id: guestUserId || null,
                        }),
                      }
                    );

                    const result = await response.json();

                    if (response.ok && result.uuid) {
                      setCurrentUserId(result.uuid);
                      setUuidType("permanent");
                      setUserRole(result.role || "user");
                      setIsLoggedIn(true);
                      setShowRegisterForm(false);
                      console.log(
                        "✅ [Web Site] Kayıt başarılı:",
                        result.uuid,
                        "Role:",
                        result.role
                      );
                    } else {
                      alert(
                        "Kayıt başarısız: " +
                          (result.error || "Bilinmeyen hata")
                      );
                    }
                  } catch (fetchError) {
                    console.error("❌ [Web Site] Fetch hatası:", fetchError);
                    alert("Bağlantı hatası");
                  }
                } catch (error) {
                  console.error("❌ [Web Site] Kayıt hatası:", error);
                  alert("Bağlantı hatası");
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şifre
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="En az 6 karakter"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Kayıt Ol
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterForm(false);
                      setShowLoginForm(true);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Giriş Yap
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        onToggle={handleSidebarToggle}
        currentUserId={currentUserId}
        userRole={userRole}
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

          {/* Arama Kutusu ve Tümünü Sil */}
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

          {/* Loading State */}
          {status === "loading" ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Ürünler yükleniyor...</p>
            </div>
          ) : status === "no-extension" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Eklenti Henüz Kurulmadı
              </h3>
              <p className="text-gray-600 mb-4">
                Ürünlerinizi görmek için önce Chrome eklentisini kurmanız
                gerekiyor.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("install")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Kurulum Talimatlarına Git
              </button>
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
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2"
                      >
                        İndir
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            "https://drive.google.com/file/d/12xB8igD7wLhPvHHo0ZMWmLzLrIzbYd8v/view?usp=drive_link",
                            "_blank"
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2"
                      >
                        Drive
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
                </div>

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
                            "https://drive.google.com/file/d/12xB8igD7wLhPvHHo0ZMWmLzLrIzbYd8v/view?usp=drive_link",
                            "_blank"
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2"
                      >
                        Drive
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
                            "https://drive.google.com/file/d/12xB8igD7wLhPvHHo0ZMWmLzLrIzbYd8v/view?usp=drive_link",
                            "_blank"
                          )
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ml-2"
                      >
                        Drive
                      </button>
                    </li>
                    <li>Safari'de "Develop" menüsünü açın</li>
                    <li>"Show Extension Builder" seçin</li>
                    <li>"+" butonuna tıklayın</li>
                    <li>"Add Extension" seçin</li>
                    <li>İndirdiğiniz klasörü seçin</li>
                  </ol>
                </div>
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
                    <li>"Tüm Listem Extension"ı bulun</li>
                    <li>"Remove" butonuna tıklayın</li>
                    <li>Onay penceresinde "Remove" seçin</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-orange-600">Firefox:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>
                      Firefox'ta{" "}
                      <code className="bg-gray-200 px-1 rounded">
                        about:debugging
                      </code>{" "}
                      adresine gidin
                    </li>
                    <li>"This Firefox" sekmesine tıklayın</li>
                    <li>"Tüm Listem Extension"ı bulun</li>
                    <li>"Remove" butonuna tıklayın</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-green-600">Safari:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>Safari'de "Develop" menüsünü açın</li>
                    <li>"Show Extension Builder" seçin</li>
                    <li>"Tüm Listem Extension"ı seçin</li>
                    <li>"Remove" butonuna tıklayın</li>
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

          {/* Teknik Bilgiler Section - En alta - Sadece admin kullanıcılar için */}
          {userRole === "admin" && (
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
                          <strong>Browser Support:</strong> Chrome, Brave,
                          Firefox, Safari
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
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-700 mb-3">
                      🛠️ Geliştirici Araçları:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleDebug}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Debug
                      </button>
                      <button
                        onClick={handleRefresh}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Yenile
                      </button>
                      <button
                        onClick={handleTest}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Test
                      </button>
                      <button
                        onClick={handleStorageDebug}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Storage Debug
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
