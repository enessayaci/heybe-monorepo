import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Trash2 } from "lucide-react";

function ExtensionInstall() {
  // Extension dosyalarını indir
  const handleDownloadExtension = () => {
    try {
      const localUrl = "/extension-files.zip";

      const link = document.createElement("a");
      link.href = localUrl;
      link.download = "my-list-sepet-extension.zip";
      link.target = "_blank";

      // Hata durumunda kullanıcıya bilgi ver
      link.onerror = () => {
        alert(
          "Dosya indirme başarısız. Lütfen manuel kurulum talimatlarını takip edin."
        );
      };

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("📦 Extension dosyaları indiriliyor...");
    } catch (error) {
      console.error("❌ Dosya indirme hatası:", error);
      alert(
        "Dosya indirme başarısız. Lütfen manuel kurulum talimatlarını takip edin."
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      {/* Butonlar */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() =>
            document
              .getElementById("install")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="flex-1"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Kurulum Talimatları
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open("/tum-listem-extension.zip", "_blank")}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Extension İndir
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            document
              .getElementById("uninstall")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Kaldırma Talimatları
        </Button>
      </div>
    </div>
  );
}

export default ExtensionInstall;
