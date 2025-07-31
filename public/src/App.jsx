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
  const handleRefresh = () => {
    console.log("🔄 Refresh butonu tıklandı");
    fetchProducts();
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
    
    // Polling: Extension'dan UUID gelene kadar bekle
    const pollInterval = setInterval(async () => {
      console.log("🔍 [Polling] UUID kontrol ediliyor...");
      try {
        const userId = await getUserId();
        if (userId) {
          console.log("✅ [Polling] UUID bulundu, polling durduruluyor:", userId);
          clearInterval(pollInterval);
          await fetchProducts(); // Ürünleri çek
        }
      } catch (e) {
        console.log("⚠️ [Polling] UUID kontrol hatası:", e);
      }
    }, 1000); // Her 1 saniyede kontrol et
    
    // 30 saniye sonra polling'i durdur
    setTimeout(() => {
      console.log("⏰ [Polling] 30 saniye geçti, polling durduruluyor");
      clearInterval(pollInterval);
    }, 30000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Test fonksiyonu
  const handleTest = () => {
    console.log("🧪 Test butonu tıklandı");
    fetch(GET_PRODUCTS_ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        alert("API Test: " + JSON.stringify(data, null, 2));
      })
      .catch((error) => {
        alert("API Test Hatası: " + error.message);
      });
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
    try {
      setStatus("loading");
      const userId = await getUserId();
      const response = await fetch(
        `${GET_PRODUCTS_ENDPOINT}?user_id=${userId}`
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

  const handleDeleteProduct = async (productId) => {
    setDeletingProductId(productId);
    try {
      const response = await fetch(DELETE_PRODUCT_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId, user_id: await getUserId() }),
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
    if (
      !confirm(
        "Tüm ürünleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!"
      )
    ) {
      return;
    }

    try {
      for (const product of products) {
        await fetch(DELETE_PRODUCT_ENDPOINT, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: product.id }),
        });
      }

      console.log("✅ Tüm ürünler silindi");
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

  // Helper hazır olana kadar bekle
  function waitForSharedDB() {
    if (window.ExtensionSharedDB) return Promise.resolve();
    return new Promise((res) => window.addEventListener('ExtensionSharedDBReady', res, { once: true }));
  }

  // Kullanıcı ID'sini al veya oluştur - IndexedDB Shared Storage
  async function getUserId() {
    await waitForSharedDB();
    console.log("🔍 [Web Site] UUID aranıyor (IndexedDB shared storage)...");
    
    // IndexedDB'den UUID'yi al (tüm domain'ler paylaşır)
    let userId = null;
    
    try {
      if (window.ExtensionSharedDB) {
        userId = await window.ExtensionSharedDB.getUUID();
        if (userId) {
          console.log("✅ [Web Site] UUID IndexedDB'den alındı:", userId);
          console.log("👤 Extension'dan gelen UUID:", userId);
          return userId;
        }
      } else {
        console.log("⚠️ [Web Site] IndexedDB helper yüklenmemiş");
      }
    } catch (e) {
      console.log("❌ IndexedDB okunamadı:", e);
    }
    
    // Fallback: localStorage (sadece bu domain için)
    userId = localStorage.getItem("EXTENSION_UUID");
    if (userId) {
      console.log("⚠️ [Web Site] UUID localStorage'dan alındı (fallback):", userId);
      console.log("👤 Extension'dan gelen UUID:", userId);
      // IndexedDB'ye de yaz (shared olsun)
      try {
        if (window.ExtensionSharedDB) {
          await window.ExtensionSharedDB.setUUID(userId);
          console.log("✅ [Web Site] UUID IndexedDB'ye kopyalandı");
        }
      } catch (e) {
        console.log("❌ IndexedDB yazılamadı:", e);
      }
      return userId;
    }

    // Hiç UUID yok, yeni oluştur
    userId = generateUUID();
    
    // IndexedDB'ye yaz (shared storage)
    try {
      if (window.ExtensionSharedDB) {
        await window.ExtensionSharedDB.setUUID(userId);
        console.log("✅ [Web Site] Yeni UUID IndexedDB'ye yazıldı:", userId);
      }
    } catch (e) {
      console.log("❌ IndexedDB yazılamadı:", e);
    }
    
    // Fallback: localStorage'a da yaz
    localStorage.setItem("EXTENSION_UUID", userId);
    localStorage.setItem("tum_listem_user_id", userId); // Backward compatibility
    
    console.log("👤 [Tüm Listem] Yeni kullanıcı ID oluşturuldu:", userId);
    return userId;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <Sidebar onToggle={handleSidebarToggle} />

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

          {/* Stats - Her durumda göster */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsCard
              title="Toplam Ürün"
              value={status === "error" ? "N/A" : stats.totalProducts}
              icon="📦"
            />
            <StatsCard
              title="Farklı Site"
              value={status === "error" ? "N/A" : stats.uniqueSites}
              icon="🌐"
            />
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

          {/* Teknik Bilgiler Section - En alta */}
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
                        <strong>Content Scripts:</strong> Tüm URL'lerde çalışır
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-green-600 mb-2">
                      Teknik Altyapı:
                    </h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>
                        <strong>API Endpoint:</strong> Vercel + Neon PostgreSQL
                      </li>
                      <li>
                        <strong>Frontend:</strong> React + TailwindCSS + Shadcn
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
