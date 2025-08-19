import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Monitor } from "lucide-react";

function ExtensionInstall() {
  const handleInstallClick = () => {
    document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadClick = () => {
    window.open(
      "https://drive.google.com/file/d/1od3THFjoZpTJW7il8GBNQwEkUK4Wvb3S/view?usp=sharing",
      "_blank"
    );
  };

  const handleKeyDown = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Butonlar */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={handleInstallClick}
            onKeyDown={(e) => handleKeyDown(e, handleInstallClick)}
            className="flex-1 min-w-[200px]"
            tabIndex={0}
            aria-label="Kurulum talimatlarını görüntüle"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Kurulum Talimatları
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadClick}
            onKeyDown={(e) => handleKeyDown(e, handleDownloadClick)}
            className="flex-1 min-w-[200px]"
            tabIndex={0}
            aria-label="Extension dosyasını indir"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            İndir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExtensionInstall;
