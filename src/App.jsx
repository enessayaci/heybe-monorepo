import React, { useEffect, useState } from "react";

async function fetchMyListFromDatabase(setExtensionStatus = null) {
  try {
    console.log("🔍 Database'den ürünler getiriliyor...");

    // 1. Extension'dan UUID'yi al (Message Passing ile)
    let userId = null;

    // Extension'a mesaj gönder ve UUID'yi al
    if (window.chrome && chrome.runtime) {
      try {
        userId = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: "getUserId" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log("⚠️ Extension mesaj hatası:", chrome.runtime.lastError);
                reject(new Error("Extension bulunamadı"));
                return;
              }
              
              if (response && response.userId) {
                console.log("✅ Extension'dan UUID alındı:", response.userId);
                resolve(response.userId);
              } else {
                console.log("❌ Extension'dan UUID alınamadı");
                reject(new Error("UUID bulunamadı"));
              }
            }
          );
        });

        if (userId && setExtensionStatus) {
          setExtensionStatus("found");
        }
      } catch (error) {
        console.log("❌ Extension mesajlaşma hatası:", error.message);
        
        // Fallback: Doğrudan storage'a erişmeyi dene (sadece extension context'inde çalışır)
        if (window.chrome && chrome.storage && chrome.storage.local) {
          try {
            userId = await new Promise((resolve) => {
              chrome.storage.local.get(
                ["tum_listem_user_id", "tum_listem_backup_uuid"],
                (result) => {
                  let foundUUID = result.tum_listem_user_id;

                  // Ana UUID yoksa backup'tan dene
                  if (!foundUUID && result.tum_listem_backup_uuid) {
                    console.log(
                      "🔄 Ana UUID yok, backup UUID kullanılıyor:",
                      result.tum_listem_backup_uuid
                    );
                    foundUUID = result.tum_listem_backup_uuid;

                    // Backup'ı ana UUID'ye kopyala
                    chrome.storage.local.set(
                      { tum_listem_user_id: foundUUID },
                      () => {
                        console.log("✅ Backup UUID ana UUID olarak restore edildi");
                      }
                    );
                  }

                  // Backup yoksa ve ana UUID varsa backup oluştur
                  if (foundUUID && !result.tum_listem_backup_uuid) {
                    console.log("💾 Backup UUID oluşturuluyor:", foundUUID);
                    chrome.storage.local.set({ tum_listem_backup_uuid: foundUUID });
                  }

                  resolve(foundUUID);
                }
              );
            });

            if (userId && setExtensionStatus) {
              setExtensionStatus("found");
            }
          } catch (storageError) {
            console.log("❌ Storage erişim hatası:", storageError);
          }
        }
      }
    }

    if (!userId) {
      console.log("❌ UUID bulunamadı, boş liste döndürülüyor");
      if (setExtensionStatus) {
        setExtensionStatus("missing");
      }
      return [];
    }

    console.log("👤 UUID bulundu:", userId);

    // 2. Database'den ürünleri çek
    const response = await fetch(
      `https://my-list-pi.vercel.app/api/get-products?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Database'den gelen veri:", data);

    if (data.success && data.products) {
      // API formatını frontend formatına çevir
      const formattedProducts = data.products.map((product) => ({
        name: product.name,
        price: product.price,
        image: product.image_url,
        product_url: product.product_url,
        url: product.product_url, // Backward compatibility
        site: product.site,
        id: product.id,
      }));

      console.log(`✅ ${formattedProducts.length} ürün başarıyla alındı`);
      return formattedProducts;
    } else {
      console.log("⚠️ API başarılı ama ürün yok");
      return [];
    }
  } catch (error) {
    console.error("❌ Database'den veri alınırken hata:", error);
    return [];
  }
}

// UUID ile veri çekme fonksiyonu (content script'ten gelen UUID için)
async function fetchDataWithUUID(userId) {
  try {
    console.log("🔍 UUID ile veri çekiliyor:", userId);
    
    const response = await fetch(
      `https://my-list-pi.vercel.app/api/get-products?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Database'den gelen veri:", data);

    if (data.success && data.products) {
      // API formatını frontend formatına çevir
      const formattedProducts = data.products.map((product) => ({
        name: product.name,
        price: product.price,
        image: product.image_url,
        product_url: product.product_url,
        url: product.product_url, // Backward compatibility
        site: product.site,
        id: product.id,
      }));

      console.log(`✅ ${formattedProducts.length} ürün başarıyla alındı`);
      setProducts(formattedProducts);
    } else {
      console.log("⚠️ API başarılı ama ürün yok");
      setProducts([]);
    }
  } catch (error) {
    console.error("❌ UUID ile veri çekilirken hata:", error);
    setProducts([]);
  }
}

// Ürün linkini aç
const handleOpenProduct = (product) => {
  console.log("🔗 [Tüm Listem] Ürün linki açılıyor:", product.product_url);
  window.open(product.product_url, "_blank");
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extensionStatus, setExtensionStatus] = useState("checking"); // checking, found, missing

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🚀 Sayfa yüklendi, veri alınıyor...");

        const result = await fetchMyListFromDatabase(setExtensionStatus);
        console.log("📋 fetchMyListFromDatabase'den dönen sonuç:", result);
        console.log("📋 Sonuç uzunluğu:", result.length);
        console.log("📋 Sonuç tipi:", typeof result);
        console.log("📋 Array mi?", Array.isArray(result));

        // State'i güncellemeden önce kontrol
        console.log("🔄 setProducts çağrılıyor, veri:", result);
        setProducts(result);
        console.log("✅ setProducts çağrıldı");
      } catch (error) {
        console.error("❌ Sayfa: Veri alınırken hata:", error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
        console.log("🏁 Loading false yapıldı");
      }
    };

    // Content script'ten gelen UUID'yi dinle
    const handleExtensionUUID = (event) => {
      const uuid = event.detail.uuid;
      console.log("📨 [Web Site] Content script'ten UUID alındı:", uuid);
      
      if (uuid) {
        console.log("✅ Extension bulundu, UUID:", uuid);
        setExtensionStatus("found");
        // UUID'yi kullanarak veri çek
        fetchDataWithUUID(uuid);
      } else {
        console.log("❌ Extension UUID bulunamadı");
        setExtensionStatus("missing");
      }
    };

    // UUID event listener'ını ekle
    document.addEventListener('extensionUUIDReceived', handleExtensionUUID);

    // Fallback: Eğer content script çalışmazsa manuel kontrol
    const checkExtensionOnLoad = async () => {
      console.log("🔍 Sayfa yüklendi, extension kontrol ediliyor...");
      
      if (window.chrome && chrome.runtime) {
        try {
          const userId = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { action: "getUserId" },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.log("⚠️ Extension mesaj hatası:", chrome.runtime.lastError);
                  reject(new Error("Extension bulunamadı"));
                  return;
                }
                resolve(response?.userId);
              }
            );
          });

          if (userId) {
            console.log("✅ Extension bulundu, UUID:", userId);
            setExtensionStatus("found");
            fetchDataWithUUID(userId);
          } else {
            console.log("❌ Extension UUID bulunamadı");
            setExtensionStatus("missing");
          }
        } catch (error) {
          console.log("⚠️ Extension kontrol hatası:", error.message);
          setExtensionStatus("missing");
        }
      } else {
        console.log("❌ Chrome API mevcut değil");
        setExtensionStatus("missing");
      }
    };

    // 3 saniye sonra fallback kontrolü yap
    setTimeout(checkExtensionOnLoad, 3000);

    // Extension kontrol timer'ı (extension sonradan yüklenirse)
    const extensionCheckTimer = setInterval(async () => {
      console.log("🔄 Extension kontrol ediliyor...");

      if (window.chrome && chrome.runtime) {
        try {
          const userId = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { action: "getUserId" },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error("Extension bulunamadı"));
                  return;
                }
                resolve(response?.userId);
              }
            );
          });

          if (userId && products.length === 0) {
            console.log("🎉 Extension UUID bulundu, veriler yeniden yükleniyor!");
            setExtensionStatus("found");
            fetchData();
          }
        } catch (error) {
          console.log("⚠️ Extension kontrol hatası:", error.message);
        }
      }
    }, 5000); // 5 saniyede bir kontrol

    // Cleanup
    return () => {
      clearInterval(extensionCheckTimer);
    };
  }, [products.length]);

  // State değişikliklerini izle
  useEffect(() => {
    console.log("🔄 Products state değişti:", products);
    console.log("🔄 Products uzunluğu:", products.length);
  }, [products]);

  // Debug fonksiyonu - Extension Storage ve Database bilgilerini göster
  const handleDebugStorage = () => {
    console.log("🔧 Debug butonu tıklandı");

    if (window.chrome && chrome.runtime) {
      chrome.runtime.sendMessage(
        { action: "getUserId" },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.log("❌ Extension debug hatası:", chrome.runtime.lastError);
            alert("Extension bulunamadı! Extension yüklü mü?");
            return;
          }

          const userId = response?.userId;
          console.log("👤 Extension'dan gelen UUID:", userId);

          if (userId) {
            try {
              const response = await fetch(
                `https://my-list-pi.vercel.app/api/get-products?user_id=${userId}`
              );
              const data = await response.json();
              console.log("📦 Database'den gelen ürünler:", data);
              
              // UUID sync durumunu kontrol et
              let syncStatus = "✅ Senkronize";
              if (data.products && data.products.length === 0) {
                syncStatus = "⚠️ UUID senkronizasyon sorunu olabilir";
              }
              
              alert(
                `Extension UUID: ${userId}\n` +
                  `Ürün sayısı: ${data.products?.length || 0}\n` +
                  `Database bağlantısı: ✅\n` +
                  `Sync Durumu: ${syncStatus}`
              );
            } catch (error) {
              console.error("❌ Database debug hatası:", error);
              alert("Database bağlantı hatası! Console'a bakın.");
            }
          } else {
            alert("UUID bulunamadı! Extension yüklü mü?");
          }
        }
      );
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
    fetchMyListFromDatabase().then((result) => {
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
        <div>Ürün sayısı: {products.length}</div>
        <div>
          Extension Durumu:{" "}
          {extensionStatus === "checking"
            ? "🔄 Kontrol ediliyor..."
            : extensionStatus === "found"
            ? "✅ Extension bulundu"
            : "❌ Extension bulunamadı"}
        </div>
        <div>Chrome API: {window.chrome ? "✅ Mevcut" : "❌ Yok"}</div>
        <div>
          Storage API: {window.chrome?.storage ? "✅ Mevcut" : "❌ Yok"}
        </div>
        {error && <div className="text-red-600">Hata: {error}</div>}
      </div>

      {/* Extension Kurulum Uyarısı */}
      {extensionStatus === "missing" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <div className="font-medium text-yellow-800">
                Tüm Listem Extension Gerekli
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                Ürünlerinizi görmek için önce browser extension'ını kurmanız
                gerekiyor.
              </div>
              <div className="text-xs text-yellow-600 mt-2">
                Extension kurulduktan sonra bu sayfa otomatik olarak
                güncellenecek.
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => handleOpenProduct(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleOpenProduct(product);
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
