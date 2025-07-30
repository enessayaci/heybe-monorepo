import React, { useState, useEffect } from "react";
import { Package, Globe } from "lucide-react";
import ProductCard from "./components/ProductCard";
import StatsCard from "./components/StatsCard";
import Sidebar from "./components/Sidebar";

function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // API endpoint'leri - Vercel + Neon DB
  const API_BASE = "https://my-list-pi.vercel.app/api";
  const GET_PRODUCTS_ENDPOINT = `${API_BASE}/get-products`;
  const DELETE_PRODUCT_ENDPOINT = `${API_BASE}/delete-product`;

  // Sidebar toggle handler
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // API'den ürünleri çek
  const fetchProducts = async () => {
    try {
      console.log("🚀 API'den ürünler çekiliyor...");
      setStatus("loading");
      setError(null);

      const response = await fetch(GET_PRODUCTS_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("📦 API'den gelen veri:", result);

        if (result.success) {
          setProducts(result.products || []);
          setStatus("success");
        } else {
          setError("API hatası: " + result.error);
          setStatus("error");
        }
      } else {
        setError("HTTP hatası: " + response.status);
        setStatus("error");
      }
    } catch (error) {
      console.error("❌ API çekme hatası:", error);
      setError("Network hatası: " + error.message);
      setStatus("error");
    }
  };

  // Ürün sil
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(DELETE_PRODUCT_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId }),
      });

      if (response.ok) {
        console.log("✅ Ürün silindi:", productId);
        fetchProducts(); // Listeyi yenile
      } else {
        setError("Ürün silinirken hata oluştu");
      }
    } catch (error) {
      console.error("❌ Silme hatası:", error);
      setError("Silme hatası: " + error.message);
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
  const handleOpenProduct = (url) => {
    window.open(url, "_blank");
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

  // Minimal istatistikler
  const calculateStats = () => {
    const totalProducts = products.length;
    const uniqueSites = [...new Set(products.map((p) => p.site))].length;
    return { totalProducts, uniqueSites };
  };

  const stats = calculateStats();

  useEffect(() => {
    console.log("🚀 Ana sayfa yüklendi");
    fetchProducts();
  }, []);

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
              icon={Package}
            />
            <StatsCard
              title="Farklı Site"
              value={status === "error" ? "N/A" : stats.uniqueSites}
              icon={Globe}
            />
          </div>

          {/* Loading State */}
          {status === "loading" && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ürünler yükleniyor...</p>
            </div>
          )}

          {/* Empty State - Ürün yoksa */}
          {status === "success" && products.length === 0 && (
            <div id="products" className="text-center py-12">
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  📦 Henüz ürün yok
                </h3>
                <p className="text-gray-600">
                  Browser extension'ınızı kullanarak ürün ekleyin ve burada
                  görün!
                </p>
              </div>
            </div>
          )}

          {/* Products List - Tek satır formatında */}
          {status === "success" && products.length > 0 && (
            <>
              {/* Tümünü Sil Butonu - Ürün listesinin üstünde */}
              <div className="mb-4">
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
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

              <div id="products" className="space-y-3 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteProduct}
                    onOpenProduct={handleOpenProduct}
                  />
                ))}
              </div>
            </>
          )}

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
                    <li>"My List Sepet Extension"ı bulun</li>
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
                    <li>"My List Sepet Extension"ı bulun</li>
                    <li>"Remove" butonuna tıklayın</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-green-600">Safari:</h5>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>Safari'de "Develop" menüsünü açın</li>
                    <li>"Show Extension Builder" seçin</li>
                    <li>"My List Sepet Extension"ı seçin</li>
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
