import React, { useEffect, useState } from "react";

function fetchMyListFromExtension() {
  return new Promise((resolve) => {
    console.log("🔍 Chrome API kontrol ediliyor...");
    console.log("window.chrome:", window.chrome);
    console.log("chrome.storage:", window.chrome?.storage);

    if (window.chrome && chrome.storage && chrome.storage.local) {
      console.log("✅ Chrome Storage API mevcut, doğrudan okuyorum...");
      chrome.storage.local.get(["myList"], (result) => {
        console.log("📦 Doğrudan storage'dan okunan veri:", result);
        if (chrome.runtime.lastError) {
          console.error("❌ Storage okuma hatası:", chrome.runtime.lastError);
          resolve([]);
        } else {
          const myList = result.myList || [];
          console.log("📋 Okunan liste:", myList);
          console.log("📋 Liste uzunluğu:", myList.length);
          console.log("📋 Liste tipi:", typeof myList);
          console.log("📋 Array mi?", Array.isArray(myList));
          resolve(myList);
        }
      });
    } else {
      console.log(
        "❌ Chrome Storage API mevcut değil, background script deniyorum..."
      );
      // Fallback: Background script üzerinden
      if (window.chrome && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({ type: "getMyList" }, (response) => {
          console.log("📨 Background'dan gelen yanıt:", response);
          if (chrome.runtime.lastError) {
            console.error("❌ Background hatası:", chrome.runtime.lastError);
            resolve([]);
          } else {
            resolve(response?.myList || []);
          }
        });
      } else {
        console.log("❌ Hiçbir Chrome API mevcut değil");
        resolve([]);
      }
    }
  });
}

function handleGoToProduct(url) {
  window.open(url, "_blank");
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🚀 Popup açıldı, veri alınıyor...");

        const result = await fetchMyListFromExtension();
        console.log("📋 fetchMyListFromExtension'dan dönen sonuç:", result);
        console.log("📋 Sonuç uzunluğu:", result.length);
        console.log("📋 Sonuç tipi:", typeof result);
        console.log("📋 Array mi?", Array.isArray(result));

        // State'i güncellemeden önce kontrol
        console.log("🔄 setProducts çağrılıyor, veri:", result);
        setProducts(result);
        console.log("✅ setProducts çağrıldı");
      } catch (error) {
        console.error("❌ Popup: Veri alınırken hata:", error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
        console.log("🏁 Loading false yapıldı");
      }
    };

    fetchData();
  }, []);

  // State değişikliklerini izle
  useEffect(() => {
    console.log("🔄 Products state değişti:", products);
    console.log("🔄 Products uzunluğu:", products.length);
  }, [products]);

  // Debug fonksiyonu - Chrome storage'ı konsola yazdır
  const handleDebugStorage = () => {
    console.log("🔧 Debug butonu tıklandı");
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(null, (result) => {
        console.log("📦 Tüm Chrome Storage (doğrudan):", result);
        console.log("📦 myList:", result.myList);
        console.log("📦 myList uzunluğu:", result.myList?.length);
        alert("Storage içeriği console'da görünüyor!");
      });
    } else if (window.chrome && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ type: "logStorage" }, (response) => {
        console.log("🔧 Debug: Storage yazdırma isteği gönderildi");
        if (chrome.runtime.lastError) {
          console.error("❌ Debug hatası:", chrome.runtime.lastError);
        }
      });
    } else {
      console.log("❌ Chrome API debug için mevcut değil");
      alert("Chrome API mevcut değil!");
    }
  };

  // Manuel test fonksiyonu
  const handleTestConnection = () => {
    console.log("🧪 Test bağlantısı tıklandı");
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ type: "test" }, (response) => {
        console.log("🧪 Test yanıtı:", response);
        alert("Test yanıtı: " + JSON.stringify(response));
      });
    } else {
      alert("Chrome API mevcut değil!");
    }
  };

  // Force refresh fonksiyonu
  const handleForceRefresh = () => {
    console.log("🔄 Force refresh tıklandı");
    setLoading(true);
    fetchMyListFromExtension().then((result) => {
      console.log("🔄 Force refresh sonucu:", result);
      setProducts(result);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="w-80 h-32 flex items-center justify-center bg-white">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-96 overflow-y-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">My List Sepet</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDebugStorage}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Chrome Storage'ı konsola yazdır"
          >
            🔧 Debug
          </button>
          <button
            onClick={handleForceRefresh}
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
            title="Zorla yenile"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleTestConnection}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            title="Bağlantıyı test et"
          >
            🧪 Test
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-100 rounded">
        <div>Popup çalışıyor! Ürün sayısı: {products.length}</div>
        <div>Chrome API: {window.chrome ? "✅ Mevcut" : "❌ Yok"}</div>
        <div>
          Storage API: {window.chrome?.storage ? "✅ Mevcut" : "❌ Yok"}
        </div>
        <div>Runtime ID: {window.chrome?.runtime?.id || "Yok"}</div>
        <div>
          Products state: {JSON.stringify(products).substring(0, 100)}...
        </div>
        {error && <div className="text-red-600">Hata: {error}</div>}
      </div>

      {products.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          <div className="mb-4">
            Henüz ürün eklenmedi veya eklenti izinleri verilmedi.
          </div>
          <div className="text-xs text-gray-400">
            Console'da debug bilgilerini kontrol edin (F12)
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((product, idx) => (
            <li
              key={product.url + idx}
              className="flex items-center gap-3 border rounded-lg p-3 bg-gray-50"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  width={64}
                  height={64}
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-16 h-16 flex items-center justify-center bg-gray-200 text-gray-400 rounded-md border text-xs"
                  style={{ flexShrink: "0" }}
                >
                  Yok
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium truncate text-sm"
                  title={product.name}
                >
                  {product.name}
                </div>
                <div className="text-blue-700 font-semibold mt-1 text-sm">
                  {product.price}
                </div>
                <button
                  className="mt-2 text-xs text-blue-600 underline hover:text-blue-800 focus:outline-none"
                  tabIndex={0}
                  aria-label="Ürüne git"
                  onClick={() => handleGoToProduct(product.url)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoToProduct(product.url);
                  }}
                >
                  Ürüne Git
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
