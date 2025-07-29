import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Trash2 } from "lucide-react";

function ExtensionInstall() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showUninstall, setShowUninstall] = useState(false);

  // Manuel kurulum için
  const handleManualInstall = () => {
    setShowInstructions(true);
    setShowUninstall(false);
  };

  // Kaldırma talimatları için
  const handleUninstall = () => {
    setShowUninstall(true);
    setShowInstructions(false);
  };

  // Extension dosyalarını indir
  const handleDownloadExtension = () => {
    const link = document.createElement("a");
    link.href = "/extension-files.zip";
    link.download = "my-list-sepet-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🛒 My List Sepet Extension'ını Kurun
        </h3>
        <p className="text-gray-600">
          Alışveriş sitelerinde ürünleri kolayca listenize ekleyin
        </p>
      </div>

      {/* Ana Butonlar - Yan Yana */}
      <div className="flex gap-3 mb-6">
        <Button
          variant="outline"
          onClick={handleManualInstall}
          className="flex-1"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Kurulum Talimatları
        </Button>

        <Button
          variant="outline"
          onClick={handleDownloadExtension}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Dosyaları İndir
        </Button>
      </div>

      {/* İkinci Buton Satırı */}
      <div className="flex gap-3 mb-6">
        <Button variant="outline" onClick={handleUninstall} className="flex-1">
          <Trash2 className="w-4 h-4 mr-2" />
          Kaldırma Talimatları
        </Button>
        <div className="flex-1"></div> {/* Boş alan */}
      </div>

      {/* Kurulum Talimatları */}
      {showInstructions && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-4">📋 Kurulum Adımları:</h4>

          <div className="space-y-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-600">Chrome/Brave:</h5>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Extension dosyalarını indirin</li>
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
                <li>Extension dosyalarını indirin</li>
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
                <li>Safari'de "Develop" menüsünü açın</li>
                <li>"Show Extension Builder" seçin</li>
                <li>"+" butonuna tıklayın</li>
                <li>"Add Extension" seçin</li>
                <li>İndirdiğiniz klasörü seçin</li>
              </ol>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowInstructions(false)}
            className="mt-4 w-full"
          >
            Talimatları Kapat
          </Button>
        </div>
      )}

      {/* Kaldırma Talimatları */}
      {showUninstall && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold mb-4 text-red-800">
            🗑️ Kaldırma Adımları:
          </h4>

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
                <strong>Not:</strong> Extension kaldırıldıktan sonra kaydedilen
                ürünler veritabanında kalır. Tamamen silmek için web sayfasından
                ürünleri tek tek silebilirsiniz.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowUninstall(false)}
            className="mt-4 w-full"
          >
            Talimatları Kapat
          </Button>
        </div>
      )}

      {/* Teknik Bilgiler - En Alta */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            🔧 Teknik Detaylar (Geliştirici Bilgileri)
          </summary>
          <div className="mt-3 text-xs text-gray-600 space-y-2">
            <p>
              <strong>Extension ID:</strong> my-list-sepet-extension
            </p>
            <p>
              <strong>Manifest Version:</strong> 3
            </p>
            <p>
              <strong>Permissions:</strong> scripting, activeTab
            </p>
            <p>
              <strong>Content Scripts:</strong> Tüm URL'lerde çalışır
            </p>
            <p>
              <strong>API Endpoint:</strong> Vercel + Neon PostgreSQL
            </p>
            <p>
              <strong>Browser Support:</strong> Chrome, Brave, Firefox, Safari
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default ExtensionInstall;
