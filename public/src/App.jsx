import React, { useState, useEffect } from "react";
import { Package, Globe, DollarSign } from "lucide-react";
import ProductCard from "./components/ProductCard";
import StatsCard from "./components/StatsCard";
import ActionButtons from "./components/ActionButtons";
import StatusBar from "./components/StatusBar";
import ExtensionInstall from "./components/ExtensionInstall";

function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [apiStatus, setApiStatus] = useState("loading");
  const [lastUpdate, setLastUpdate] = useState("-");
  const [error, setError] = useState(null);

  // API endpoint'leri - Vercel + Neon DB
  const API_BASE = "https://my-list-pi.vercel.app/api";
  const GET_PRODUCTS_ENDPOINT = `${API_BASE}/get-products`;
  const DELETE_PRODUCT_ENDPOINT = `${API_BASE}/delete-product`;

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
          setApiStatus("success");
          setLastUpdate(new Date().toLocaleString("tr-TR"));
        } else {
          setError("API hatası: " + result.error);
          setStatus("error");
          setApiStatus("error");
        }
      } else {
        setError("HTTP hatası: " + response.status);
        setStatus("error");
        setApiStatus("error");
      }
    } catch (error) {
      console.error("❌ API çekme hatası:", error);
      setError("Network hatası: " + error.message);
      setStatus("error");
      setApiStatus("error");
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

  // İstatistikleri hesapla
  const calculateStats = () => {
    const totalProducts = products.length;
    const uniqueSites = [...new Set(products.map((p) => p.site))].length;

    const prices = products
      .map((p) => p.price)
      .filter((p) => p && p.match(/[\d.,]+/))
      .map((p) => parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")));

    const avgPrice =
      prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    return { totalProducts, uniqueSites, avgPrice };
  };

  const stats = calculateStats();

  useEffect(() => {
    console.log("🚀 Ana sayfa yüklendi");
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛒 My List Sepet
          </h1>
          <p className="text-lg text-gray-600">
            Alışveriş listenizi yönetin ve takip edin
          </p>
        </div>

        {/* Status Bar */}
        <StatusBar
          status={status}
          apiStatus={apiStatus}
          productCount={products.length}
          lastUpdate={lastUpdate}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Toplam Ürün"
            value={stats.totalProducts}
            icon={Package}
          />
          <StatsCard
            title="Farklı Site"
            value={stats.uniqueSites}
            icon={Globe}
          />
          <StatsCard
            title="Ortalama Fiyat"
            value={`₺${stats.avgPrice.toFixed(2)}`}
            icon={DollarSign}
          />
        </div>

        {/* Extension Install */}
        <ExtensionInstall />

        {/* Action Buttons */}
        <div className="mb-8">
          <ActionButtons
            onDebug={handleDebug}
            onRefresh={handleRefresh}
            onTest={handleTest}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ürünler yükleniyor...</p>
          </div>
        )}

        {/* Empty State */}
        {status === "success" && products.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                📦 Henüz ürün yok
              </h3>
              <p className="text-gray-600">
                Browser extension'ınızı kullanarak ürün ekleyin ve burada görün!
              </p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {status === "success" && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
                onOpenProduct={handleOpenProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
