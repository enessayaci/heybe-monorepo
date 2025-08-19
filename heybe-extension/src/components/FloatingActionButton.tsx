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

  useEffect(() => {
    checkAuthStatus();
    checkPage();

    // URL değişikliklerini dinle
    const handleUrlChange = () => {
      setTimeout(checkPage, 1000);
    };

    window.addEventListener("popstate", handleUrlChange);

    // DOM değişikliklerini izle
    const observer = new MutationObserver(() => {
      setTimeout(checkPage, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      observer.disconnect();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      setIsAuthenticated(isLoggedIn);
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsAuthenticated(false);
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

    // Auth kontrolü - misafir token yoksa modal aç
    if (!skipAuth && !isAuthenticated) {
      const hasGuestToken = await authService.hasValidToken();
      if (!hasGuestToken) {
        setShowAuthModal(true);
        return;
      }
    }

    setState("loading");

    try {
      // Misafir token yoksa oluştur
      if (!isAuthenticated) {
        await authService.ensureGuestToken();
      }

      const productInfo = extractProductInfo();
      if (!productInfo) {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      const result = await apiService.addProduct(productInfo);
      if (result.success) {
        setState("success");
        onProductSaved?.();
        setTimeout(() => setState("idle"), 2000);
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsAuthenticated(true);
    setTimeout(() => handleAddToHeybe(true), 500);
  };

  const handleContinueAsGuest = async () => {
    try {
      await authService.ensureGuestToken();
      setShowAuthModal(false);
      await handleAddToHeybe(true);
    } catch (error) {
      console.error("Guest continuation failed:", error);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const handleViewList = () => {
    window.open("https://my-heybe.vercel.app", "_blank");
  };

  const getAddButtonContent = () => {
    switch (state) {
      case "loading":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Check
              style={{ width: "20px", height: "20px", color: "#10b981" }}
            />
            <span>{t("productAdded")}</span>
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
      backgroundColor = "#f8f9fa";
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
    marginRight: isHovered ? "0px" : "-280px",
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
          disabled={state === "loading"}
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
          onClose={() => setShowAuthModal(false)}
          onContinueAsGuest={handleContinueAsGuest}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
