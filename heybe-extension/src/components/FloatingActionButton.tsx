import React, { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle, List } from "lucide-react";
import { authService } from "../services/auth.service";
import { apiService } from "../services/api.service";
import { storageService } from "../services/storage.service";
import type { AddProductRequest } from "../services/api.types";
import { AuthModal } from "./AuthModal";
import { t } from "../lib/i18n";

interface FloatingActionButtonProps {
  onProductSaved?: () => void;
}

type ButtonState = "idle" | "loading" | "success" | "error" | "hidden";

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onProductSaved,
}) => {
  const [state, setState] = useState<ButtonState>("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isProductPage, setIsProductPage] = useState(false);
  const [authError, setAuthError] = useState<string>(""); // Yeni state eklendi

  useEffect(() => {
    // API servisine unauthorized callback'i set et - hata mesajını da al
    apiService.setUnauthorizedCallback((errorMessage?: string) => {
      setIsAuthenticated(false);
      setAuthError(errorMessage || "Kimlik doğrulama hatası");
      setShowAuthModal(true);
    });
  
    // İlk sayfa kontrolü
    checkPage();
  
    let checkCount = 0;
    let checkInterval: NodeJS.Timeout | null = null;
  
    const startUrlBasedCheck = () => {
      // Önceki interval'ı temizle
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      
      checkCount = 0;
      
      // 5 kere, 1'er saniye aralıklarla kontrol yap
      checkInterval = setInterval(() => {
        checkCount++;
        checkPage();
        
        if (checkCount >= 5) {
          clearInterval(checkInterval!);
          checkInterval = null;
        }
      }, 1000);
    };
  
    // URL değişikliklerini yakalamak için event listener'lar
    const handleUrlChange = () => {
      startUrlBasedCheck();
    };
  
    // Browser back/forward butonları için
    window.addEventListener('popstate', handleUrlChange);
  
    // SPA navigation için history API'sini override et
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
  
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      // Micro-task olarak çalıştır ki DOM güncellensin
      setTimeout(handleUrlChange, 0);
    };
  
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(handleUrlChange, 0);
    };
  
    // Cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      window.removeEventListener('popstate', handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // checkAuthStatus fonksiyonu artık sadece buton tıklandığında çağrılacak
  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      setIsAuthenticated(isLoggedIn);
      return isLoggedIn;
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const checkPage = () => {
    const isProduct = detectProductPage();
    setIsProductPage(isProduct);
    setState(isProduct ? "idle" : "hidden");
  };

  const detectProductPage = (): boolean => {
    // Ana sayfa kontrolü
    if (isHomePage()) {
      return false;
    }

    // Heybe website'inde buton gösterme
    if (isHeybeWebsite()) {
      return false;
    }

    // Sepete ekle butonu arama
    const hasAddToCartButton = checkAddToCartButton();
    if (!hasAddToCartButton) {
      return false;
    }

    // Meta tag kontrolü
    const hasProductMeta = isProductDetailPage();
    return hasProductMeta;
  };

  const isHomePage = (): boolean => {
    const pathname = window.location.pathname.toLowerCase();
    const homePatterns = [
      /^\/$/,
      /^\/index(\.html?)?$/,
      /^\/home(\.html?)?$/,
      /^\/anasayfa(\.html?)?$/,
    ];
    return (
      homePatterns.some((pattern) => pattern.test(pathname)) ||
      document.title.toLowerCase().includes("ana sayfa") ||
      document.title.toLowerCase().includes("homepage")
    );
  };

  const isHeybeWebsite = (): boolean => {
    const hostname = window.location.hostname;
    return (
      hostname === "my-heybe.vercel.app" ||
      hostname === "localhost" ||
      hostname.includes("vercel.app")
    );
  };

  const checkAddToCartButton = (): boolean => {
    const addToCartTexts = [
      "sepete ekle",
      "sepet",
      "satın al",
      "hemen al",
      "add to cart",
      "buy now",
      "purchase",
      "order now",
      "add to bag",
      "buy",
    ];

    const relevantButtons = Array.from(
      document.querySelectorAll(
        "button, a, input[type='button'], div[role='button'], [data-testid*='cart'], [data-testid*='buy']"
      )
    );

    return relevantButtons.some((btn) => {
      const text = (
        btn.textContent ||
        (btn as HTMLInputElement).value ||
        ""
      ).toLowerCase();
      return addToCartTexts.some((cartText) => text.includes(cartText));
    });
  };

  const isProductDetailPage = (): boolean => {
    // Meta tag kontrolü
    const productMeta =
      document.querySelector('meta[property="og:type"][content="product"]') ||
      document.querySelector('meta[name="product"]') ||
      document.querySelector('[itemtype*="Product"]');

    if (productMeta) return true;

    // Ürün fiyatı kontrolü
    const priceSelectors = [
      '[data-testid*="price"]',
      ".price",
      ".product-price",
      '[class*="price"]',
      '[id*="price"]',
    ];

    const hasPrice = priceSelectors.some((selector) =>
      document.querySelector(selector)
    );

    // Ürün resmi kontrolü
    const productImages = document.querySelectorAll(
      'img[src*="product"], img[alt*="product"], .product-image img, [data-testid*="product-image"] img'
    );

    return hasPrice && productImages.length > 0;
  };

  const extractProductInfo = (): AddProductRequest | null => {
    try {
      const title =
        document.querySelector("h1")?.textContent?.trim() ||
        document
          .querySelector('[data-testid="product-title"]')
          ?.textContent?.trim() ||
        document.querySelector(".product-title")?.textContent?.trim() ||
        document.title;

      const price =
        document.querySelector('[data-testid="price"]')?.textContent?.trim() ||
        document.querySelector(".price")?.textContent?.trim() ||
        document.querySelector(".product-price")?.textContent?.trim() ||
        "";

      const imageElement = document.querySelector(
        'img[src*="product"], img[alt*="product"], .product-image img, [data-testid="product-image"] img'
      ) as HTMLImageElement;
      const image = imageElement?.src || "";

      if (!title) {
        console.error("Product title not found");
        return null;
      }

      const productData: AddProductRequest = {
        name: title,
        price: price,
        image_urls: image ? [image] : [],
        url: window.location.href,
        site: window.location.hostname,
        // description alanı kaldırıldı - AddProductRequest tipinde yok
      };

      return productData; // Return statement eklendi
    } catch (error) {
      console.error("Error extracting product info:", error);
      return null;
    }
  };

  const handleAddToHeybe = async (skipAuth = false) => {
    if (state === "loading") return;

    // Auth kontrolü - sadece skipAuth false ise kontrol et
    if (!skipAuth) {
      // Burada auth durumunu kontrol et
      const isLoggedIn = await checkAuthStatus();

      if (!isLoggedIn) {
        // İlk kurulumda otomatik guest token oluşturmak yerine auth modal aç
        setShowAuthModal(true);
        return;
      }
    }

    setState("loading");

    try {
      // SORUN: Bu kısım skipAuth=true olsa bile çalışıyor!
      // Sadece authenticated değilse guest token oluştur
      if (!skipAuth && !isAuthenticated) {
        await authService.ensureGuestToken();
      }

      const productInfo = extractProductInfo();
      if (!productInfo) {
        setState("error");
        setTimeout(() => setState("idle"), 4000); // 4 saniye
        return;
      }

      const result = await apiService.addProduct(productInfo);
      if (result.success) {
        setState("success");
        onProductSaved?.();
        setTimeout(() => {
          setState("idle");
        }, 4000); // 4 saniye
      } else {
        // 401 hatası durumunda auth modal zaten açılmış olacak
        if (result.status !== 401) {
          setState("error");
          setTimeout(() => setState("idle"), 4000); // 4 saniye
        } else {
          setState("idle");
        }
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setState("error");
      setTimeout(() => setState("idle"), 4000); // 4 saniye
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);

    // Token'ı yeniden kontrol et - auth.service.ts zaten doğru token'ı kaydetmiş olmalı
    const isLoggedIn = await authService.isLoggedIn();
    setIsAuthenticated(isLoggedIn);

    // Kısa bir bekleme sonrası ürünü ekle
    setTimeout(() => handleAddToHeybe(true), 500);
  };

  const handleContinueAsGuest = async () => {
    try {
      setAuthError(""); // Clear error message

      // Backend'den guest token iste ve storage'a kaydet
      await authService.ensureGuestToken();

      // Auth state'ini güncelle - artık token var
      setIsAuthenticated(true);

      // Modal'ı kapat ve hata mesajını temizle
      setShowAuthModal(false);
      setAuthError("");

      // Ürünü ekle (skipAuth=true çünkü token zaten var)
      await handleAddToHeybe(true);
    } catch (error) {
      console.error("Guest continuation failed:", error);
      setAuthError("Misafir token oluşturulamadı"); // Hata mesajını göster
      setState("error");
      setTimeout(() => setState("idle"), 4000); // 4 saniye (8000'den değiştirildi)
    }
  };

  const handleViewList = () => {
    window.open("https://my-heybe.vercel.app", "_blank");
  };

  const getAddButtonContent = () => {
    switch (state) {
      case "loading":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
            }}
          >
            <Loader2
              style={{
                width: "20px",
                height: "20px",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>{t("productAdding")}</span>
          </div>
        );
      case "success":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              position: "relative",
            }}
          >
            <Check
              style={{ width: "20px", height: "20px", color: "#10b981" }}
            />
            <span style={{ color: "#10b981" }}>{t("productAdded")}</span>
            {/* Success progress bar - 4 saniye boyunca dolan */}
            <div
              style={{
                position: "absolute",
                bottom: "-3px",
                left: "0",
                width: "0%", // Başlangıç width'ini 0% olarak ayarla
                height: "3px",
                backgroundColor: "#10b981",
                borderRadius: "0 0 8px 8px",
                animation: "successProgress 4s ease-out forwards", // 4 saniye
              }}
            />
          </div>
        );
      case "error":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle
              style={{ width: "20px", height: "20px", color: "#ef4444" }}
            />
            <span>{t("productAddError")}</span>
          </div>
        );
      default:
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src="https://my-heybe.vercel.app/logo.png"
              width="20"
              height="20"
              style={{ objectFit: "contain" }}
              alt="Heybe Logo"
            />
            <span>{t("productAddToHeybe")}</span>
          </div>
        );
    }
  };

  const getAddButtonStyle = () => {
    let backgroundColor = "#f8f9fa";
    let color = "#374151";

    if (state === "success") {
      backgroundColor = "#f0fdf4"; // Açık yeşil arka plan
      color = "#10b981";
    }

    return {
      background: backgroundColor,
      color: color,
      padding: "0 24px 0 12px",
      border: "none",
      fontSize: "16px",
      cursor: state === "loading" ? "not-allowed" : "pointer",
      height: "48px",
      width: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap" as const,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      position: "relative" as const,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      opacity: state === "loading" ? 0.7 : 1, // Loading state'inde opacity azalt
    };
  };

  const containerStyle = {
    position: "fixed" as const,
    top: "50%",
    right: "0",
    transform: "translateY(-50%)",
    display: "flex",
    zIndex: 99999,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: "24px 0 0 24px",
    overflow: "visible" as const,
    marginRight:
      isHovered || state === "success" || state === "error" ? "0px" : "-280px",
    transition: "margin-right 0.3s cubic-bezier(.4,0,.2,1)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const viewButtonStyle = {
    background: "#f59e0b",
    color: "white",
    padding: "0 16px 0 8px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    height: "48px",
    width: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
    whiteSpace: "nowrap" as const,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  // Hidden state kontrolü - buton gizliyse render etme
  if (state === "hidden") {
    return null;
  }

  return (
    <>
      <div
        style={containerStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sol taraf - "Heybeye Ekle" butonu */}
        <button
          onClick={() => handleAddToHeybe()}
          disabled={state === "loading" || state === "success" || state === "error"} // Loading, success ve error durumlarında disable et
          style={getAddButtonStyle()}
        >
          {getAddButtonContent()}
        </button>

        {/* Sağ taraf - "Listeyi Gör" butonu */}
        <button onClick={handleViewList} style={viewButtonStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <List style={{ width: "16px", height: "16px" }} />
            <span>{t("productViewList")}</span>
          </div>
        </button>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setAuthError(""); // Modal kapanırken hata mesajını temizle
          }}
          onContinueAsGuest={handleContinueAsGuest}
          onAuthSuccess={handleAuthSuccess}
          error={authError} // Hata mesajını modal'a geç
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes successProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  );
};
