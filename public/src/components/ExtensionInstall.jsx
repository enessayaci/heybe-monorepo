import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Chrome, Globe, Monitor } from "lucide-react";

function ExtensionInstall() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [detectedBrowser, setDetectedBrowser] = useState(null);

  // Tarayıcı tespiti
  React.useEffect(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      setDetectedBrowser("chrome");
    } else if (userAgent.includes("Firefox")) {
      setDetectedBrowser("firefox");
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      setDetectedBrowser("safari");
    } else {
      setDetectedBrowser("other");
    }
  }, []);

  // Extension kurulum linkleri
  const extensionLinks = {
    chrome:
      "https://chrome.google.com/webstore/detail/my-list-sepet-extension/your-extension-id",
    firefox:
      "https://addons.mozilla.org/en-US/firefox/addon/my-list-sepet-extension/",
    safari: "https://apps.apple.com/app/my-list-sepet-extension/id123456789",
    other: null,
  };

  // Chrome/Brave için extension kurulumu
  const handleChromeInstall = () => {
    // Manuel kurulum için talimatları göster
    setShowInstructions(true);
  };

  // Firefox için extension kurulumu
  const handleFirefoxInstall = () => {
    // Manuel kurulum için talimatları göster
    setShowInstructions(true);
  };

  // Safari için extension kurulumu
  const handleSafariInstall = () => {
    // Manuel kurulum için talimatları göster
    setShowInstructions(true);
  };

  // Manuel kurulum için
  const handleManualInstall = () => {
    setShowInstructions(true);
  };

  // Extension dosyalarını indir
  const handleDownloadExtension = () => {
    // Extension dosyalarını zip olarak indir
    const link = document.createElement("a");
    link.href = "/extension-files.zip"; // Bu dosyayı public klasörüne ekleyeceğiz
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

      {/* Otomatik Kurulum */}
      {detectedBrowser && detectedBrowser !== "other" && (
        <div className="mb-4">
          <Button
            onClick={
              detectedBrowser === "chrome"
                ? handleChromeInstall
                : detectedBrowser === "firefox"
                ? handleFirefoxInstall
                : handleSafariInstall
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {detectedBrowser === "chrome" && (
              <Chrome className="w-4 h-4 mr-2" />
            )}
            {detectedBrowser === "firefox" && (
              <Globe className="w-4 h-4 mr-2" />
            )}
            {detectedBrowser === "safari" && <Globe className="w-4 h-4 mr-2" />}
            {detectedBrowser === "chrome"
              ? "Chrome/Brave'e Kur"
              : detectedBrowser === "firefox"
              ? "Firefox'e Kur"
              : "Safari'ye Kur"}
          </Button>
        </div>
      )}

      {/* Manuel Kurulum */}
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
