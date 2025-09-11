import React, { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle, List } from "lucide-react";
import type { AddProductRequest } from "../services/api.types";
import { AuthModal } from "./AuthModal";
import { t } from "../lib/i18n";
import { apiBridge } from "@/services/content.api.bridge";
import { authService } from "@/services/auth.service";

interface FloatingActionButtonProps {
  onProductSaved?: () => void;
}

type ButtonState = "idle" | "loading" | "success" | "error" | "hidden";

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onProductSaved,
}) => {
  const [state, setState] = useState<ButtonState>("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [productError, setProductError] = useState<string>("");

  useEffect(() => {
    apiBridge.setUnauthorizedCallback((errorMessage?: string) => {
      setAuthError(errorMessage || t("authError"));
      setShowAuthModal(true);
    });

    let checkCount = 0;
    let checkInterval: NodeJS.Timeout | null = null;

    const checkPage = () => {
      const isProduct = detectProductPage();
      console.log("first isProduct: ", isProduct);

      setState(isProduct ? "idle" : "hidden");

      if (!isProduct && checkCount < 5) {
        if (checkInterval) clearInterval(checkInterval);
        checkCount = 0;
        checkInterval = setInterval(() => {
          checkCount++;
          const isProductRetry = detectProductPage();
          console.log("interval isProduct: ", isProductRetry);
          setState(isProductRetry ? "idle" : "hidden");
          if (isProductRetry || checkCount >= 5) {
            clearInterval(checkInterval!);
            checkInterval = null;
          }
        }, 1000);
      }
    };

    setTimeout(checkPage, 500); // İlk kontrol 500ms gecikmeli

    const handleUrlChange = () => {
      checkCount = 0;
      setTimeout(checkPage, 500); // URL değişiminde 500ms gecikmeli kontrol
    };

    window.addEventListener("popstate", handleUrlChange);
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(handleUrlChange, 500);
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setTimeout(handleUrlChange, 500);
    };

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      window.removeEventListener("popstate", handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const detectProductPage = (): boolean => {
    const isHomePage = (): boolean => {
      const homePageIndicators = [
        window.location.pathname === "/",
        window.location.pathname === "/home",
        window.location.pathname === "/anasayfa",
        window.location.pathname === "/index",
        document.title.toLowerCase().includes("ana sayfa"),
        document.title.toLowerCase().includes("homepage"),
        window.location.href.match(/\/(home|anasayfa|index)(\/|\?|#|$)/i),
      ];
      return homePageIndicators.some((indicator) => indicator);
    };

    const isHeybeWebsite = (): boolean => {
      const hostname = window.location.hostname;
      return (
        hostname === "my-heybe.vercel.app" ||
        hostname === "localhost" ||
        hostname.includes("vercel.app")
      );
    };

    const checkAddToCartButton = (): {
      hasButton: boolean;
      buttonCount: number;
      topButton: Element | null;
    } => {
      const addToCartTexts = [
        "sepete ekle",
        "satın al",
        "hemen al",
        "add to cart",
        "buy now",
        "purchase",
        "order now",
        "add to bag",
        "buy",
        "kaufen",
        "in den warenkorb",
        "acheter",
        "ajouter au panier",
        "comprar",
        "añadir al carrito",
        "acquista",
        "aggiungi al carrello",
        "add +",
        "+ cart",
        "🛒",
        "🛍️",
      ];

      const addToCartButtons: Element[] = [];

      // XPath ile anahtar kelimeyi içeren metin düğümlerinin parent'larını bul, script etiketlerini hariç tut
      addToCartTexts.forEach((text) => {
        const escapedText = text.replace(/'/g, "\\'");
        const xpathQuery = `.//text()[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${escapedText}')]/parent::*[not(self::script) and not(ancestor::header) and not(ancestor::nav) and not(ancestor::*[contains(@class, 'header')]) and not(ancestor::*[contains(@class, 'nav')])]`;
        const elements = document.evaluate(
          xpathQuery,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        for (let i = 0; i < elements.snapshotLength; i++) {
          const element = elements.snapshotItem(i) as HTMLElement;
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            parseFloat(style.opacity) !== 0 &&
            rect.width > 0 &&
            rect.height > 0 &&
            element.offsetParent !== null
          ) {
            console.log("Found visible element with text: ", element);
            addToCartButtons.push(element);
          }
        }
      });

      let topButton: Element | null = null;
      let minTop = Infinity;
      console.log("addToCartButtons: ", addToCartButtons);

      addToCartButtons.forEach((button) => {
        console.log("addToCartButtons foreach: ", button);

        const rect = button.getBoundingClientRect();
        console.log("rect top kontrolü öncesi: ", rect);

        if (
          rect.top < minTop &&
          rect.top >= 0 &&
          rect.width > 0 &&
          rect.height > 0
        ) {
          console.log("rect top kontrolü: ", rect);
          minTop = rect.top;
          topButton = button;
        }
      });

      console.log({
        hasButton: addToCartButtons.length > 0,
        buttonCount: addToCartButtons.length,
        topButton,
      });

      return {
        hasButton: addToCartButtons.length > 0,
        buttonCount: addToCartButtons.length,
        topButton,
      };
    };

    const isProductDetailPage = (): boolean => {
      const productMetaTags = [
        'meta[property="og:type"][content="product"]',
        'meta[property="product:price:amount"]',
        'meta[property="product:price:currency"]',
        'meta[name="twitter:data1"]',
        'meta[property="product:availability"]',
      ];
      return productMetaTags.some((selector) =>
        document.querySelector(selector)
      );
    };

    const checkButtonPlacement = (button: Element): boolean => {
      if (!button) return false;
      const rect = button.getBoundingClientRect();
      const isInTopHalf = rect.top < window.innerHeight + 100;
      console.log("isInTopHalf: ", isInTopHalf);

      return isInTopHalf;
    };

    if (isHomePage() || isHeybeWebsite()) {
      console.log("isHomePage:", isHomePage());
      console.log("isHeybeWebsite: ", isHeybeWebsite());

      return false;
    }
    const addToCartResult = checkAddToCartButton();
    if (!addToCartResult.hasButton) {
      console.log("addToCartResult.hasButton: ", addToCartResult.hasButton);
      return false;
    }
    if (isProductDetailPage()) {
      console.log("isProductDetailPage: ", isProductDetailPage());

      return true;
    }
    if (
      addToCartResult.buttonCount < 12 &&
      addToCartResult.topButton &&
      checkButtonPlacement(addToCartResult.topButton) &&
      extractProductNameFromUrl().length > 10
    ) {
      return true;
    }
    console.log(".........");

    return false;
  };

  const siteSpecificRules: Record<
    string,
    {
      titleSelector?: string;
      priceSelector?: string;
      imageSelectors?: string[];
    }
  > = {
    "trendyol.com": {
      titleSelector: "h1.pr-new-br",
      priceSelector: "span.prc-dsc",
      imageSelectors: ["img.pv-main-image", "img.gallery-image"], // Örnek: Birden fazla resim seçici
    },
    // Diğer siteler için kurallar eklenebilir, örneğin:
    // 'amazon.com': {
    //   titleSelector: '#productTitle',
    //   priceSelector: '.a-price-whole',
    //   imageSelectors: ['#landingImage']
    // }
  };

  const extractProductInfo = (): AddProductRequest | null => {
    try {
      const hostname = window.location.hostname;
      const rules = siteSpecificRules[hostname] || {};

      // Başlık çıkarma
      let finalProductName = "Ürün";
      if (rules.titleSelector) {
        const titleElement = document.querySelector(rules.titleSelector);
        if (titleElement?.textContent?.trim()) {
          finalProductName = titleElement.textContent.trim();
        }
      } else {
        // Genel algoritma
        const metaTags: Record<string, string> = {};
        document.querySelectorAll("meta").forEach((meta) => {
          const name =
            meta.getAttribute("name") || meta.getAttribute("property");
          const content = meta.getAttribute("content");
          if (name && content) metaTags[name.toLowerCase()] = content;
        });

        const metaProductName =
          metaTags["og:title"] ||
          metaTags["twitter:title"] ||
          document.title.split(/[|\-–—]/)[0].trim();

        const urlProductName = extractProductNameFromUrl();
        const domProductName = findProductNameInDOM(urlProductName);
        const h1ProductName =
          document.querySelector("h1")?.textContent?.trim() || "";

        const candidates = [
          { name: metaProductName, priority: 4 },
          { name: domProductName, priority: 3 },
          { name: h1ProductName, priority: 2 },
          { name: urlProductName, priority: 1 },
        ].filter((c) => c.name && c.name.length > 3);

        if (candidates.length > 0) {
          const domainKeywords = hostname.split(".")[0];
          const withoutDomain = candidates.filter(
            (c) => !c.name.toLowerCase().includes(domainKeywords)
          );
          const finalCandidates =
            withoutDomain.length > 0 ? withoutDomain : candidates;
          finalProductName = finalCandidates.reduce((best, current) =>
            current.priority > best.priority ||
            (current.priority === best.priority &&
              current.name.length > best.name.length)
              ? current
              : best
          ).name;
        }
      }

      // Fiyat çıkarma
      let price = "";
      if (rules.priceSelector) {
        const priceElement = document.querySelector(rules.priceSelector);
        if (priceElement?.textContent?.trim()) {
          price = priceElement.textContent.trim();
        }
      } else {
        // Genel algoritma
        const metaTags: Record<string, string> = {};
        document.querySelectorAll("meta").forEach((meta) => {
          const name =
            meta.getAttribute("name") || meta.getAttribute("property");
          const content = meta.getAttribute("content");
          if (name && content) metaTags[name.toLowerCase()] = content;
        });
        price = metaTags["product:price:amount"] || extractPriceFromDOM();
      }

      // Resim çıkarma
      let imageUrls: string[] = [];
      if (rules.imageSelectors && rules.imageSelectors.length > 0) {
        const expectedCount = rules.imageSelectors.length;
        rules.imageSelectors.forEach((selector) => {
          const imgElement = document.querySelector(
            selector
          ) as HTMLImageElement | null;
          const src =
            imgElement?.src || imgElement?.getAttribute("data-src") || "";
          if (src) {
            imageUrls.push(src);
          }
        });

        // Eksik resimler için genel algoritmayı kullan
        while (imageUrls.length < expectedCount) {
          const fallbackImage = findLargerProductImage();
          if (fallbackImage) {
            imageUrls.push(fallbackImage);
            break; // Sadece bir fallback ekle, veya daha fazla için modifiye et
          } else {
            break;
          }
        }
      } else {
        // Genel algoritma
        const metaTags: Record<string, string> = {};
        document.querySelectorAll("meta").forEach((meta) => {
          const name =
            meta.getAttribute("name") || meta.getAttribute("property");
          const content = meta.getAttribute("content");
          if (name && content) metaTags[name.toLowerCase()] = content;
        });
        const primaryImageUrl = metaTags["og:image"] || "";
        const secondaryImageUrl = findLargerProductImage();
        imageUrls = [primaryImageUrl, secondaryImageUrl].filter(
          (url) => url && url.length > 0
        );
      }

      return {
        name: finalProductName,
        price: price || "",
        image_urls: imageUrls,
        url: window.location.href,
        site: hostname,
      };
    } catch (error) {
      console.error("Error extracting product info:", error);
      return null;
    }
  };

  const extractProductNameFromUrl = (): string => {
    const pathname = window.location.pathname;
    const segments = pathname
      .split("/")
      .filter((segment) => segment.length > 0);
    let bestSegment = "";
    for (const segment of segments) {
      if (
        segment.includes("-") &&
        segment.length > 10 &&
        segment.length > bestSegment.length &&
        !/^\d+$/.test(segment.replace(/-/g, ""))
      ) {
        bestSegment = segment;
      }
    }
    return bestSegment
      ? bestSegment
          .split("-")
          .filter((word) => word.length > 1 && !/^\d+$/.test(word))
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]/g, "")
          .trim()
      : "";
  };

  const findProductNameInDOM = (urlProductName: string): string => {
    if (!urlProductName) return "";
    const searchTerms = urlProductName
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 2);
    const allTextElements = document.querySelectorAll(
      "h1, [class*='title'], [class*='name'], [data-testid*='title']"
    );
    let bestMatch = "";
    let bestScore = 0;

    for (const element of allTextElements) {
      const text = element.textContent?.toLowerCase() || "";
      const matchCount = searchTerms.filter((term) =>
        text.includes(term)
      ).length;
      const score = matchCount / searchTerms.length;
      if (score >= 0.6 && score > bestScore) {
        bestScore = score;
        bestMatch = element.textContent?.trim() || "";
      }
    }
    return bestMatch;
  };

  const extractPriceFromDOM = (): string => {
    const priceSelectors = [
      "[class*='price']",
      "[class*='fiyat']",
      "[data-testid*='price']",
    ];
    for (const selector of priceSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim() || "";
        const priceMatch = text.match(/[\d.,]+\s*(₺|TL|\$|€|USD|EUR)/i);
        if (priceMatch) return priceMatch[0];
      }
    }
    return "";
  };

  const findLargerProductImage = (): string => {
    const images = Array.from(document.querySelectorAll("img"))
      .filter(
        (img) =>
          (img.src || img.getAttribute("data-src") || "").length > 50 &&
          !img.src.includes("logo") &&
          !img.alt?.toLowerCase().includes("logo") &&
          img.width > 100 &&
          img.height > 100
      )
      .sort((a, b) => b.width * b.height - a.width * a.height);
    return images[0]?.src || images[0]?.getAttribute("data-src") || "";
  };

  const handleAddToHeybe = async (skipAuth = false) => {
    try {
      if (state === "loading") return;

      const isLoggedIn = await authService.isLoggedIn();

      if (!skipAuth) {
        if (!isLoggedIn) {
          setShowAuthModal(true);
          return;
        }
      }

      setState("loading");

      if (!skipAuth && !isLoggedIn) {
        await authService.ensureGuestToken();
      }

      const productInfo = extractProductInfo();
      if (!productInfo || !productInfo.name) {
        setProductError(t("productInfoError"));
        setState("error");
        setTimeout(() => setState("idle"), 4000);
        return;
      }

      const result = await apiBridge.addProduct(productInfo);
      if (result.success) {
        setState("success");
        onProductSaved?.();
        setTimeout(() => setState("idle"), 4000);
      } else {
        if (result.status !== 401) {
          setProductError(t("productAddError"));
          setState("error");
          setTimeout(() => setState("idle"), 4000);
        } else {
          setState("idle");
        }
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setProductError(t("productAddError"));
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    setAuthError("");
    setTimeout(() => handleAddToHeybe(true), 500);
  };

  const handleContinueAsGuest = async () => {
    try {
      setAuthError("");
      await authService.ensureGuestToken();
      setShowAuthModal(false);
      await handleAddToHeybe(true);
    } catch (error) {
      console.error("Guest continuation failed:", error);
      setAuthError(t("guestTokenError"));
      setState("error");
      setTimeout(() => setState("idle"), 4000);
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
            <div
              style={{
                position: "absolute",
                bottom: "-3px",
                left: "0",
                width: "0%",
                height: "3px",
                backgroundColor: "#10b981",
                borderRadius: "0 0 8px 8px",
                animation: "successProgress 4s ease-out forwards",
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
            <span>{productError || t("productAddError")}</span>
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
      backgroundColor = "#f0fdf4";
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
      opacity: state === "loading" ? 0.7 : 1,
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
        <button
          onClick={() => handleAddToHeybe()}
          disabled={
            state === "loading" || state === "success" || state === "error"
          }
          style={getAddButtonStyle()}
        >
          {getAddButtonContent()}
        </button>
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
            setAuthError("");
          }}
          onContinueAsGuest={handleContinueAsGuest}
          onAuthSuccess={handleAuthSuccess}
          error={authError}
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
