import React from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Monitor,
  Trash2,
  Settings,
  Package,
  ExternalLink,
} from "lucide-react";

function StickyHeader({ onScrollToSection }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    }
  };

  // Extension dosyalarını otomatik indir
  const handleDownloadExtension = () => {
    try {
      const localUrl = "/heybe-extension.zip";

      const link = document.createElement("a");
      link.href = localUrl;
      link.download = "heybe-extension.zip";
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
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Shopping Basket" className="w-6 h-6" />
            <h1 className="text-lg font-bold text-gray-900">Heybe</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("products")}
              className="text-xs px-2 py-1 h-8"
            >
              <Package className="w-3 h-3 mr-1" />
              Ürünlerim
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("install")}
              className="text-xs px-2 py-1 h-8"
            >
              <Monitor className="w-3 h-3 mr-1" />
              Kurulum
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("uninstall")}
              className="text-xs px-2 py-1 h-8"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Kaldırma
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadExtension}
              className="text-xs px-2 py-1 h-8"
            >
              <Download className="w-3 h-3 mr-1" />
              İndir
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(
                  "https://drive.google.com/file/d/1od3THFjoZpTJW7il8GBNQwEkUK4Wvb3S/view?usp=sharing",
                  "_blank"
                )
              }
              className="text-xs px-2 py-1 h-8"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Drive
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("technical")}
              className="text-xs px-2 py-1 h-8"
            >
              <Settings className="w-3 h-3 mr-1" />
              Geliştirici
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default StickyHeader;
