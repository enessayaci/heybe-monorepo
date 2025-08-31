# Heybe Website - Frontend Geliştirme Dokümantasyonu

## 📊 Frontend Progress Tablosu

| Bileşen/Kategori                     | Durum           | Açıklama                                        |
| ------------------------------------ | --------------- | ----------------------------------------------- |
| **Frontend Website (heybe-website)** | ✅ Tamamlandı   | React + shadcn + Tailwind frontend uygulaması   |
| **Storage Senkronizasyonu**          | ✅ Tamamlandı   | Eklenti-Website storage iletişimi               |
| **Kullanıcı Transfer Sistemi**       | ✅ Tamamlandı   | Misafir-Kayıtlı kullanıcı ürün transferi        |
| **TypeScript Definitions**           | 🔄 Devam Ediyor | TypeScript type definitions ve interface yapısı |
| **Shadcn-First Approach**            | 🔄 Devam Ediyor | Shadcn-first component hierarchy dokümantasyonu |
| **Test Senaryoları**                 | ⏳ Beklemede    | 16 maddelik test sürecinin uygulanması          |

---

## 🏗️ Frontend Proje Yapısı

### Website Klasör Yapısı

heybe-website/ # Frontend React uygulaması
├── package.json
├── src/
│ ├── App.jsx # Ana uygulama bileşeni
│ ├── components/ # React bileşenleri
│ │ ├── ui/ # shadcn UI bileşenleri
│ │ ├── Sidebar.jsx # Ana sidebar bileşeni
│ │ ├── ProductList.jsx # Ürün listesi bileşeni
│ │ └── AuthModal.jsx # Giriş/Kayıt modal bileşeni
│ ├── hooks/ # Custom React hooks
│ ├── utils/ # Yardımcı fonksiyonlar
│ ├── services/ # API servis fonksiyonları
│ └── styles/ # CSS/Tailwind stilleri
├── public/ # Statik dosyalar
├── index.html # Ana HTML dosyası
├── vite.config.js # Vite konfigürasyonu
├── tailwind.config.js # Tailwind konfigürasyonu
└── components.json # shadcn konfigürasyonu

**i18n Implementation:**

```typescript
// Website - useTranslation hook
const useTranslation = () => {
  const [language, setLanguage] = useState(() => {
    // 1. localStorage'dan kontrol et
    const saved = localStorage.getItem("heybe-language");
    if (saved && ["tr", "en"].includes(saved)) return saved;

    // 2. Browser dilini kontrol et
    const browserLang = navigator.language.split("-")[0];
    if (["tr", "en"].includes(browserLang)) return browserLang;

    // 3. Fallback to English
    return "en";
  });

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("heybe-language", lang);
  };

  const t = (key: string) => translations[language][key] || key;

  return { language, changeLanguage, t };
};
```

**Çeviri Anahtarları (Translation Keys):**

**Türkçe (tr.json):**

```json
{
  "auth": {
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "email": "E-posta",
    "password": "Şifre",
    "loginRegister": "Giriş / Kayıt",
    "logout": "Çıkış Yap"
  },
  "products": {
    "myProducts": "Ürünlerim",
    "addProduct": "Ürün Ekle",
    "deleteProduct": "Ürünü Sil",
    "noProducts": "Henüz ürün eklenmemiş",
    "noSearchResults": "Arama sonucu bulunamadı",
    "tryDifferentKeywords": "Farklı anahtar kelimeler deneyin",
    "addFirstProduct": "İlk ürününüzü eklemek için bir e-ticaret sitesini ziyaret edin",
    "product": "ürün",
    "site": "site",
    "totalProducts": "Toplam Ürün",
    "totalSites": "Toplam Site"
  },
  "extension": {
    "notFound": "Eklenti bulunamadı!",
    "installExtension": "Eklentiyi Yükle",
    "addToHeybe": "Heybeye Ekle",
    "adding": "Ekleniyor...",
    "viewList": "Listeyi Gör",
    "productAdded": "Ürün Eklendi",
    "productAddedToHeybe": "Ürün listenize eklendi!",
    "productAddError": "Ürün eklenirken hata oluştu",
    "error": "Hata!",
    "loading": "Yükleniyor...",
    "notProductPage": "Bu sayfa bir ürün sayfası değil",
    "noProductInfo": "Ürün bilgileri alınamadı",
    "networkError": "Ağ bağlantısı hatası",
    "serverError": "Sunucu hatası",
    "loginRequired": "Giriş yapmanız gerekiyor"
  },
  "common": {
    "loading": "Yükleniyor...",
    "error": "Hata oluştu",
    "success": "Başarılı",
    "cancel": "İptal",
    "save": "Kaydet",
    "delete": "Sil",
    "edit": "Düzenle",
    "search": "Ara...",
    "language": "Dil",
    "turkish": "Türkçe",
    "english": "English"
  }
}
```

**İngilizce (en.json):**

```json
{
  "auth": {
    "login": "Login",
    "register": "Register",
    "email": "Email",
    "password": "Password",
    "loginRegister": "Login / Register",
    "logout": "Logout"
  },
  "products": {
    "myProducts": "My Products",
    "addProduct": "Add Product",
    "deleteProduct": "Delete Product",
    "noProducts": "No products added yet",
    "noSearchResults": "No search results found",
    "tryDifferentKeywords": "Try different keywords",
    "addFirstProduct": "Visit an e-commerce site to add your first product",
    "product": "product",
    "site": "site",
    "totalProducts": "Total Products",
    "totalSites": "Total Sites"
  },
  "extension": {
    "notFound": "Extension not found!",
    "installExtension": "Install Extension",
    "addToHeybe": "Add to Heybe",
    "adding": "Adding...",
    "viewList": "View List",
    "productAdded": "Product Added",
    "productAddedToHeybe": "Product added to your list!",
    "productAddError": "Error adding product",
    "error": "Error!",
    "loading": "Loading...",
    "notProductPage": "This page is not a product page",
    "noProductInfo": "Could not get product information",
    "networkError": "Network connection error",
    "serverError": "Server error",
    "loginRequired": "Login required"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search...",
    "language": "Language",
    "turkish": "Türkçe",
    "english": "English"
  }
}
```

---

## 🛠️ Frontend Teknik Gereksinimler

### Frontend (heybe-website)

- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (shadcn default)
- **State Management:** React Context/useState
- **HTTP Client:** fetch API
- **Routing:** React Router (tek sayfa uygulaması)
- **Paket Yöneticisi:** pnpm

---

## 🎨 Frontend Bileşenleri

### Ana Bileşen Yapısı (Shadcn + Tailwind First, Semantic HTML Second, Minimal JS Third)

#### 1. App.tsx (Ana Uygulama)

- **Shadcn + Tailwind First:** Shadcn components ve Tailwind utilities öncelikli kullanım
- **Semantic HTML Second:** Semantic HTML5 structure with proper landmarks
- **Minimal JS Third:** Sidebar state yönetimi, Global user context
- Extension storage senkronizasyonu
- Route yönetimi with proper error boundaries

#### Sidebar Layout (Shadcn Sidebar Tabanlı)

**Shadcn Sidebar Kurulumu:**

```bash
npx shadcn@latest add sidebar
```

**Önemli Not:** Proje promptuna göre sidebar'da sadece 2 menü olacak:

1. **Ürünlerim** - Kullanıcının eklediği ürünlerin listesi
2. **Kurulum** - Eklenti kurulum rehberi ve durumu

**Sidebar.tsx - Shadcn Sidebar-07 Komponenti:**

```typescript
// components/Sidebar.tsx - Modern sidebar-07 teması ile
import { useState } from "react";
import {
  Package,
  Settings,
  LogIn,
  LogOut,
  User,
  Globe,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthModal } from "./AuthModal";
import { useTranslation } from "@/hooks/useTranslation";

type SidebarProps = {
  readonly onScrollToSection?: (sectionId: string) => void;
  readonly currentUserId?: string;
  readonly userRole?: string;
  readonly isLoggedIn: boolean;
  readonly onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  readonly onRegister: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  readonly onLogout: () => Promise<{ success: boolean }>;
  readonly currentLanguage: string;
  readonly onLanguageChange: (language: string) => void;
  readonly t: (key: string) => string;
};

export function AppSidebar({
  onScrollToSection,
  currentUserId,
  userRole,
  isLoggedIn,
  onLogin,
  onRegister,
  onLogout,
  currentLanguage,
  onLanguageChange,
  t,
}: SidebarProps) {
  const { t } = useTranslation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await onLogin(email, password);
      if (result.success) {
        setAuthModalOpen(false);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    name?: string
  ) => {
    setIsLoading(true);
    try {
      const result = await onRegister(email, password, name);
      if (result.success) {
        setAuthModalOpen(false);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await onLogout();
    } finally {
      setIsLoading(false);
    }
  };

  // Menu items - Sadece 2 menü (proje promptuna göre)
  const menuItems = [
    {
      id: "products",
      title: t("products.myProducts") || "Ürünlerim",
      icon: Package,
      action: () => scrollToSection("products"),
    },
    {
      id: "install",
      title: t("extension.installExtension") || "Kurulum",
      icon: Settings,
      action: () => scrollToSection("install"),
    },
  ];

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#" className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Package className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Heybe</span>
                    <span className="truncate text-xs">Ürün Listesi</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("common.menu") || "Menü"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={item.action}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-destructive data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt={currentUserId || "User"} />
                      <AvatarFallback className="rounded-lg">
                        {isLoggedIn ? (
                          <User className="size-4" />
                        ) : (
                          <LogIn className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {isLoggedIn
                          ? currentUserId || t("auth.user")
                          : t("auth.guest")}
                      </span>
                      <span className="truncate text-xs">
                        {userRole === "GUEST"
                          ? t("auth.guestUser")
                          : t("auth.registeredUser")}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  {!isLoggedIn ? (
                    <DropdownMenuItem onClick={() => setAuthModalOpen(true)}>
                      <LogIn className="mr-2 size-4" />
                      {t("auth.loginRegister")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      <LogOut className="mr-2 size-4" />
                      {t("auth.logout")}
                    </DropdownMenuItem>
                  )}
                  <Separator />
                  <DropdownMenuItem
                    onClick={() =>
                      onLanguageChange(currentLanguage === "tr" ? "en" : "tr")
                    }
                  >
                    <Globe className="mr-2 size-4" />
                    {currentLanguage === "tr" ? "English" : "Türkçe"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        t={t}
      />
    </>
  );
}
```

#### 2. ProductList.tsx (Ürün Listesi)

- **Shadcn + Tailwind First:** Shadcn Card, Input, Button components ile UI yapısı
- **Semantic HTML Second:** Semantic list structure, proper headings
- **Minimal JS Third:** Search/filter logic, product management

```typescript
// components/ProductList.tsx
import { useState, useMemo } from "react";
import { Search, Trash2, ExternalLink, Package, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Product = {
  readonly id: string;
  readonly name: string;
  readonly price?: string;
  readonly image_urls: string[];
  readonly url: string;
  readonly site: string;
  readonly created_at: string;
};

type ProductListProps = {
  readonly products: Product[];
  readonly onDeleteProduct: (productId: string) => Promise<void>;
  readonly isLoading: boolean;
  readonly t: (key: string) => string;
};

export function ProductList({
  products,
  onDeleteProduct,
  isLoading,
  t,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Arama ve filtreleme
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.site.toLowerCase().includes(term) ||
        product.price?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Site bazında gruplama
  const productsBySite = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      if (!acc[product.site]) {
        acc[product.site] = [];
      }
      acc[product.site].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProducts]);

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    try {
      await onDeleteProduct(productId);
    } finally {
      setDeletingId(null);
    }
  };

  const totalSites = productsBySite.length;
  const totalProducts = filteredProducts.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header ve Arama */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("products.myProducts")}
            </h2>
            <p className="text-muted-foreground">
              {totalProducts} {t("products.product")} • {totalSites}{" "}
              {t("products.site")}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ürün Listesi */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {searchTerm
              ? t("products.noSearchResults")
              : t("products.noProducts")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm
              ? t("products.tryDifferentKeywords")
              : t("products.addFirstProduct")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {productsBySite.map(([site, siteProducts]) => (
            <div key={site} className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{site}</h3>
                <Badge variant="secondary">{siteProducts.length}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {siteProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      {product.image_urls?.[0] && (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-4">
                      <h4 className="font-medium line-clamp-2 mb-2">
                        {product.name}
                      </h4>
                      {product.price && (
                        <p className="text-lg font-semibold text-primary">
                          {product.price}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(product.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t("common.view")}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === product.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("products.deleteProduct")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu ürünü silmek istediğinizden emin misiniz? Bu
                              işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("common.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 3. AuthModal.tsx (Giriş/Kayıt Modal)

- **Shadcn + Tailwind First:** Shadcn Dialog, Form, Input components kullanımı
- **Semantic HTML Second:** Form semantics, proper labels, validation
- **Minimal JS Third:** Form validation, API integration

```typescript
// components/AuthModal.tsx
import { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthModalProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  readonly onRegister: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; message?: string }>;
  readonly isLoading: boolean;
  readonly t: (key: string) => string;
};

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  isLoading,
  t,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData({ email: "", password: "", name: "" });
    setError("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("E-posta ve şifre gereklidir");
      return;
    }

    try {
      const result =
        activeTab === "login"
          ? await onLogin(formData.email, formData.password)
          : await onRegister(formData.email, formData.password, formData.name);

      if (result.success) {
        resetForm();
        onClose();
      } else {
        setError(result.message || "Bir hata oluştu");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.loginRegister")}</DialogTitle>
          <DialogDescription>
            Heybe'ye giriş yapın veya yeni hesap oluşturun
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              <LogIn className="h-4 w-4 mr-2" />
              {t("auth.login")}
            </TabsTrigger>
            <TabsTrigger value="register">
              <UserPlus className="h-4 w-4 mr-2" />
              {t("auth.register")}
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">{t("auth.email")}</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? t("common.loading")
                  : activeTab === "login"
                  ? t("auth.login")
                  : t("auth.register")}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4. InstallGuide.tsx (Kurulum Rehberi)

- **Shadcn + Tailwind First:** Shadcn Card, Badge, Alert components ile rehber yapısı
- **Semantic HTML Second:** Step-by-step guide structure
- **Minimal JS Third:** Extension detection, browser-specific instructions

```typescript
// components/InstallGuide.tsx
import { useState, useEffect } from "react";
import {
  Chrome,
  Download,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type InstallGuideProps = {
  readonly t: (key: string) => string;
};

export function InstallGuide({ t }: InstallGuideProps) {
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [browserType, setBrowserType] = useState<string>("chrome");

  useEffect(() => {
    // Browser tipini algıla
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("firefox")) {
      setBrowserType("firefox");
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      setBrowserType("safari");
    } else if (userAgent.includes("edge")) {
      setBrowserType("edge");
    } else {
      setBrowserType("chrome");
    }

    // Extension yüklü mü kontrol et
    const checkExtension = () => {
      // Extension'dan mesaj dinle
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "HEYBE_EXTENSION_PING") {
          setExtensionInstalled(true);
        }
      };

      window.addEventListener("message", handleMessage);

      // Extension'a ping gönder
      window.postMessage({ type: "HEYBE_WEBSITE_PING" }, "*");

      return () => window.removeEventListener("message", handleMessage);
    };

    const cleanup = checkExtension();
    const interval = setInterval(checkExtension, 5000); // 5 saniyede bir kontrol et

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const browserConfig = {
    chrome: {
      name: "Chrome",
      icon: Chrome,
      storeUrl: "https://chrome.google.com/webstore/detail/heybe/...",
      steps: [
        "Chrome Web Store'a gidin",
        '"Chrome\'a Ekle" butonuna tıklayın',
        'Açılan pencerede "Uzantıyı Ekle" seçin',
        "Eklenti otomatik olarak yüklenecek",
      ],
    },
    firefox: {
      name: "Firefox",
      icon: Chrome, // Firefox icon eklenebilir
      storeUrl: "https://addons.mozilla.org/firefox/addon/heybe/",
      steps: [
        "Firefox Add-ons sayfasına gidin",
        '"Firefox\'a Ekle" butonuna tıklayın',
        "İzinleri onaylayın",
        "Eklenti yüklenecek",
      ],
    },
    safari: {
      name: "Safari",
      icon: Chrome, // Safari icon eklenebilir
      storeUrl: "https://apps.apple.com/app/heybe/...",
      steps: [
        "App Store'dan Heybe uygulamasını indirin",
        "Safari > Tercihler > Uzantılar'a gidin",
        "Heybe uzantısını etkinleştirin",
        "Web sitelerinde izin verin",
      ],
    },
    edge: {
      name: "Edge",
      icon: Chrome, // Edge icon eklenebilir
      storeUrl: "https://microsoftedge.microsoft.com/addons/detail/heybe/...",
      steps: [
        "Edge Add-ons Store'a gidin",
        '"Al" butonuna tıklayın',
        "Uzantıyı ekleyin",
        "Eklenti yüklenecek",
      ],
    },
  };

  const currentBrowser =
    browserConfig[browserType as keyof typeof browserConfig];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("extension.installExtension")}
        </h2>
        <p className="text-muted-foreground">
          Heybe eklentisini yükleyerek ürünleri kolayca listenize ekleyin
        </p>
      </div>

      {/* Extension Durumu */}
      <Alert
        className={
          extensionInstalled
            ? "border-green-200 bg-green-50"
            : "border-orange-200 bg-orange-50"
        }
      >
        {extensionInstalled ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-orange-600" />
        )}
        <AlertDescription
          className={extensionInstalled ? "text-green-800" : "text-orange-800"}
        >
          {extensionInstalled
            ? "Heybe eklentisi başarıyla yüklendi! Artık ürün ekleyebilirsiniz."
            : "Heybe eklentisi bulunamadı. Lütfen aşağıdaki adımları takip ederek yükleyin."}
        </AlertDescription>
      </Alert>

      {!extensionInstalled && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <currentBrowser.icon className="h-5 w-5" />
              <CardTitle>{currentBrowser.name} için Kurulum</CardTitle>
            </div>
            <CardDescription>
              {currentBrowser.name} tarayıcınız için özel kurulum adımları
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a
                href={currentBrowser.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4 mr-2" />
                {currentBrowser.name} Store'dan İndir
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Kurulum Adımları:</h4>
              <ol className="space-y-2">
                {currentBrowser.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className="mt-0.5 min-w-6 h-6 flex items-center justify-center p-0"
                    >
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kullanım Rehberi */}
      <Card>
        <CardHeader>
          <CardTitle>Nasıl Kullanılır?</CardTitle>
          <CardDescription>
            Eklenti yüklendikten sonra ürün ekleme süreci
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>1</Badge>
                <span className="font-medium">E-ticaret sitesine gidin</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Trendyol, Hepsiburada, Amazon gibi desteklenen siteleri ziyaret
                edin
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>2</Badge>
                <span className="font-medium">Ürün sayfasını açın</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                İstediğiniz ürünün detay sayfasına gidin
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>3</Badge>
                <span className="font-medium">
                  "Heybeye Ekle" butonuna tıklayın
                </span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Sayfanın sağ alt köşesinde beliren butona tıklayın
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>4</Badge>
                <span className="font-medium">Ürün listenizde görün</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Eklenen ürün otomatik olarak listenize kaydedilir
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔄 Extension-Website Storage Senkronizasyonu

### Storage Yapısı

```typescript
// Shared storage interface
interface HeybeStorage {
  currentUuid: string; // Kullanıcı UUID'si
  auth: {
    isAuthenticated: boolean;
    role: "GUEST" | "VERIFIED";
    token?: string;
    email?: string;
  };
  products?: Product[]; // Offline cache (opsiyonel)
}
```

### Website Storage Service

```typescript
// services/storageService.ts
class StorageService {
  private readonly STORAGE_KEY = "heybe-data";

  // Extension ile senkronizasyon
  async syncWithExtension(): Promise<HeybeStorage | null> {
    return new Promise((resolve) => {
      // Extension'dan veri iste
      window.postMessage({ type: "HEYBE_REQUEST_STORAGE" }, "*");

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "HEYBE_STORAGE_RESPONSE") {
          window.removeEventListener("message", handleMessage);
          resolve(event.data.storage);
        }
      };

      window.addEventListener("message", handleMessage);

      // Timeout
      setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        resolve(null);
      }, 1000);
    });
  }

  // Website storage'ını güncelle
  updateStorage(data: Partial<HeybeStorage>) {
    const current = this.getStorage();
    const updated = { ...current, ...data };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

    // Extension'a bildir
    window.postMessage(
      {
        type: "HEYBE_STORAGE_UPDATE",
        storage: updated,
      },
      "*"
    );
  }

  getStorage(): HeybeStorage {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          currentUuid: crypto.randomUUID(),
          auth: { isAuthenticated: false, role: "GUEST" },
        };
  }
}
```

---

## 🧪 Test Senaryoları

### Frontend Test Checklist

#### 1. Sidebar Testleri

- [ ] Sidebar açılıp kapanma
- [ ] Menü navigasyonu (Ürünlerim, Kurulum)
- [ ] Dil değiştirme (TR/EN)
- [ ] Kullanıcı durumu gösterimi (Guest/Verified)
- [ ] Giriş/Çıkış işlemleri

#### 2. Ürün Listesi Testleri

- [ ] Ürün listesi yükleme
- [ ] Arama fonksiyonu
- [ ] Site bazında gruplama
- [ ] Ürün silme işlemi
- [ ] Responsive tasarım
- [ ] Boş liste durumu

#### 3. Auth Modal Testleri

- [ ] Giriş formu validasyonu
- [ ] Kayıt formu validasyonu
- [ ] Şifre göster/gizle
- [ ] Hata mesajları
- [ ] Loading durumları

#### 4. Extension Entegrasyonu

- [ ] Extension algılama
- [ ] Storage senkronizasyonu
- [ ] Ürün transfer işlemi
- [ ] Real-time güncellemeler

#### 5. i18n Testleri

- [ ] Dil değiştirme
- [ ] Çeviri anahtarları
- [ ] Browser dili algılama
- [ ] LocalStorage persistence

#### 6. Responsive Testleri

- [ ] Mobile görünüm
- [ ] Tablet görünüm
- [ ] Desktop görünüm
- [ ] Sidebar collapse

---

## 🚀 Deployment

### Build Konfigürasyonu

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Environment Variables

```env
# .env.production
VITE_API_URL=https://api.heybe.com
VITE_EXTENSION_ID=chrome-extension-id
```

### Vercel Deployment

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 📝 Önemli Notlar

1. **Shadcn-First Approach:** Tüm UI bileşenleri önce shadcn/ui ile implement edilecek
2. **TypeScript Strict Mode:** Tüm dosyalar strict TypeScript ile yazılacak
3. **Responsive Design:** Mobile-first yaklaşım benimsenecek
4. **Accessibility:** WCAG 2.1 AA standartlarına uyum
5. **Performance:** Lazy loading, code splitting, image optimization
6. **SEO:** Meta tags, structured data, sitemap
7. **PWA Ready:** Service worker, offline support hazırlığı

---

## 🔗 İlgili Dosyalar

- [Ana Roadmap](/docs/roadmap-new.md)
- [API Dokümantasyonu](/docs/api-documentation.md)
- [Extension Dokümantasyonu](/docs/extension.md)
