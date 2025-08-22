import { useState, useRef } from "react";
import { useTranslation, TranslationProvider } from "./i18n";
import { useAuth } from "./hooks/useAuth";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AuthModal } from "./components/AuthModal";
import { ProductList } from "./components/ProductList";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Chrome, Globe, Settings } from "lucide-react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const { t } = useTranslation();
  const productsRef = useRef<HTMLElement>(null);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
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

  return (
    <SidebarProvider>
      <AppSidebar
        onScrollToProducts={scrollToProducts}
        onOpenInstallModal={handleOpenInstallModal}
        onOpenAuthModal={handleOpenAuthModal}
      />
      <SidebarInset>
        {/* Main content - Header kaldırıldı */}
        <main className="flex-1 overflow-auto">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center items-center gap-4 mb-6 sm:mb-8">
                <img
                  src={viteLogo}
                  className="h-12 sm:h-16 lg:h-20"
                  alt="Vite logo"
                />
                <img
                  src={reactLogo}
                  className="h-12 sm:h-16 lg:h-20"
                  alt="React logo"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t("common.welcome")}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                {t("common.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button
                  onClick={scrollToProducts}
                  size="lg"
                  className="w-full sm:w-auto cursor-pointer"
                >
                  {t("products.viewProducts")}
                </Button>
                <Button
                  onClick={handleOpenInstallModal}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("extension.install")}
                </Button>
              </div>
            </div>
          </section>

          {/* Products Section */}
          <section
            ref={productsRef}
            className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
          >
            <ProductList onAddProduct={() => console.log("Add product")} />
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
