import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation, TranslationProvider } from "./i18n";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AuthModal } from "./components/AuthModal";
import { ProductList, type ProductListRef } from "./components/ProductList";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Chrome, Globe, Settings } from "lucide-react";
import "./App.css";
import { useListenExtensionMessaging } from "./hooks/useListenExtensionMessaging";
import { useMainStoreBase } from "./store/main";

function AppContent() {
  const isExtensionAvailable = useMainStoreBase(
    (state) => state.isExtensionAvailable
  );
  const token = useMainStoreBase((state) => state.token);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isExtensionAlertDismissed, setIsExtensionAlertDismissed] =
    useState(false);
  const { t } = useTranslation();
  useListenExtensionMessaging();
  const productsRef = useRef<HTMLElement>(null);
  const productListRef = useRef<ProductListRef>(null);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    // Ürünleri yenile

    scrollToProducts();
  };

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenInstallModal = () => {
    setIsInstallModalOpen(true);
  };

  const handleCloseInstallModal = () => {
    setIsInstallModalOpen(false);
  };

  const handleBrowserInstall = (browser: string) => {
    // Şimdilik boş - eklenti yayınlandığında store URL'leri eklenecek
    console.log(`Installing for ${browser}`);
  };

  const browsers = [
    {
      name: "chrome",
      displayName: t("setup.chrome"),
      icon: Chrome,
      color: "text-blue-600",
    },
    {
      name: "brave",
      displayName: t("setup.brave"),
      icon: Chrome, // Brave uses Chromium, so Chrome icon is appropriate
      color: "text-orange-600",
    },
    {
      name: "edge",
      displayName: t("setup.edge"),
      icon: Globe, // Using Globe as Edge icon placeholder
      color: "text-blue-500",
    },
    {
      name: "firefox",
      displayName: t("setup.firefox"),
      icon: Globe, // Using Globe as Firefox icon placeholder
      color: "text-orange-500",
    },
    {
      name: "safari",
      displayName: t("setup.safari"),
      icon: Globe, // Using Globe as Safari icon placeholder
      color: "text-blue-400",
    },
  ];

  const handleDismissExtensionAlert = () => {
    setIsExtensionAlertDismissed(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar
        onScrollToProducts={scrollToProducts}
        onOpenInstallModal={handleOpenInstallModal}
        onOpenAuthModal={handleOpenAuthModal}
        hasExtension={isExtensionAvailable}
      />
      <SidebarInset>
        {/* Extension Alert - Eklenti yüklü değilse göster */}
        {!isExtensionAvailable && !isExtensionAlertDismissed && (
          <div className="p-4 border-b bg-amber-50">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-amber-800">
                    {t("extension.notInstalled") ||
                      "Eklenti yüklü değil. Ürün eklemek için eklentiyi kurun."}
                  </span>
                  <Button
                    onClick={handleOpenInstallModal}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {t("extension.install")}
                  </Button>
                </div>
                <Button
                  onClick={handleDismissExtensionAlert}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main content - Header kaldırıldı */}
        <main className="flex-1 overflow-auto">
          {/* Hero Section - KALDIRILDI */}

          {/* Products Section */}
          <section
            ref={productsRef}
            className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
          >
            <ProductList
              ref={productListRef}
              onAddProduct={() => console.log("Add product")}
              onClickLogin={handleOpenAuthModal}
            />
          </section>
        </main>
      </SidebarInset>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Install Modal */}
      <Dialog open={isInstallModalOpen} onOpenChange={setIsInstallModalOpen}>
        <DialogContent className="sm:max-w-3xl bg-white z-50 h-[calc(100vh-100px)] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-white">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
              {t("setup.extensionInstall")}
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base">
              {t("setup.installDescription")}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-6 p-6">
              {/* Browser Installation Section */}
              <div className="space-y-2">
                {browsers.map((browser) => {
                  const IconComponent = browser.icon;
                  return (
                    <Card
                      key={browser.name}
                      className="hover:shadow-md transition-shadow border-0"
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <IconComponent
                              className={`h-6 w-6 ${browser.color}`}
                            />
                            <span className="font-medium text-lg">
                              {browser.displayName}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleBrowserInstall(browser.name)}
                            className="cursor-pointer"
                            size="sm"
                          >
                            {t("setup.installExtension")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Browser Permissions Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    {t("setup.browserPermissions")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {t("setup.permissionsDescription")}
                  </p>

                  <div className="space-y-4">
                    {browsers.map((browser) => {
                      const permissionKey =
                        `${browser.name}Permissions` as const;
                      const permissions = t(`setup.${permissionKey}`, {
                        returnObjects: true,
                      }) as {
                        title: string;
                        steps: string[];
                      };

                      return (
                        <div
                          key={browser.name}
                          className="border-l-4 border-gray-200 pl-4"
                        >
                          <h4 className="font-medium text-sm mb-2">
                            {permissions.title}
                          </h4>
                          <ol className="text-xs text-gray-600 space-y-1">
                            {permissions.steps.map((step, index) => (
                              <li key={index} className="flex gap-2">
                                <span className="text-gray-400 min-w-[1rem]">
                                  {index + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function App() {
  return (
    <TranslationProvider>
      <AppContent />
    </TranslationProvider>
  );
}

export default App;
