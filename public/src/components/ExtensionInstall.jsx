import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Monitor } from "lucide-react";

function ExtensionInstall() {
  const [showInstructions, setShowInstructions] = useState(false);

  // Manuel kurulum için
  const handleManualInstall = () => {
    setShowInstructions(true);
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
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🛒 My List Sepet Extension'ını Kurun
        </h3>
        <p className="text-gray-600">
          Alışveriş sitelerinde ürünleri kolayca listenize ekleyin
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={handleManualInstall}
          className="w-full"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Manuel Kurulum Talimatları
        </Button>

        <Button
          variant="outline"
          onClick={handleDownloadExtension}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Extension Dosyalarını İndir
        </Button>
      </div>

      {/* Kurulum Talimatları */}
      {showInstructions && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">📋 Manuel Kurulum Talimatları:</h4>
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
    </div>
  );
}

export default ExtensionInstall;
