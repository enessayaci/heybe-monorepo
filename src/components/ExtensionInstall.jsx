import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Trash2 } from "lucide-react";

function ExtensionInstall() {
  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      {/* Butonlar */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={() =>
            document
              .getElementById("install")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="flex-1 min-w-[200px]"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Kurulum Talimatları
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            window.open(
              "https://drive.google.com/file/d/1od3THFjoZpTJW7il8GBNQwEkUK4Wvb3S/view?usp=sharing",
              "_blank"
            )
          }
          className="flex-1 min-w-[200px]"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          İndir
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            document
              .getElementById("uninstall")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="flex-1 min-w-[200px]"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Kaldırma Talimatları
        </Button>
      </div>
    </div>
  );
}

export default ExtensionInstall;
