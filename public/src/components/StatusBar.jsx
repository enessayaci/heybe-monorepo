import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function StatusBar({ status, apiStatus, productCount, lastUpdate }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "loading":
        return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Hazır";
      case "error":
        return "Hata";
      case "loading":
        return "Yükleniyor...";
      default:
        return "Bilinmiyor";
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Durum:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span
                className={
                  status === "success"
                    ? "text-green-600"
                    : status === "error"
                    ? "text-red-600"
                    : "text-yellow-600"
                }
              >
                {getStatusText(status)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus)}
              <span
                className={
                  apiStatus === "success"
                    ? "text-green-600"
                    : apiStatus === "error"
                    ? "text-red-600"
                    : "text-yellow-600"
                }
              >
                {getStatusText(apiStatus)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ürün Sayısı:</span>
            <span className="font-medium">{productCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Son Güncelleme:</span>
            <span className="font-medium">{lastUpdate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatusBar;
