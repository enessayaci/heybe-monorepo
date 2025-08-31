# Heybe Monorepo Projesi - Kapsamlı Geliştirme Roadmap

## 📊 Progress Tablosu

| Bileşen/Kategori                        | Durum           | Açıklama                                        |
| --------------------------------------- | --------------- | ----------------------------------------------- |
| **Proje Yapısı**                        | ✅ Tamamlandı   | Monorepo klasör yapısının oluşturulması         |
| **Veritabanı Şeması**                   | ✅ Tamamlandı   | PostgreSQL tablo yapılarının hazırlanması       |
| **Backend API (heybe-api)**             | ✅ Tamamlandı   | Node.js backend uygulamasının geliştirilmesi    |
| **Frontend Website (heybe-website)**    | ✅ Tamamlandı   | React + shadcn + Tailwind frontend uygulaması   |
| **Browser Extension (heybe-extension)** | ✅ Tamamlandı   | WXT ile multi-browser eklenti geliştirme        |
| **Storage Senkronizasyonu**             | ✅ Tamamlandı   | Eklenti-Website storage iletişimi               |
| **Kullanıcı Transfer Sistemi**          | ✅ Tamamlandı   | Misafir-Kayıtlı kullanıcı ürün transferi        |
| **TypeScript Definitions**              | 🔄 Devam Ediyor | TypeScript type definitions ve interface yapısı |
| **Shadcn-First Approach**               | 🔄 Devam Ediyor | Shadcn-first component hierarchy dokümantasyonu |
| **Test Senaryoları**                    | ⏳ Beklemede    | 16 maddelik test sürecinin uygulanması          |

---

## 🏗️ Proje Yapısı

### Monorepo Klasör Yapısı

```
heybe/
├── package.json                    # Root package.json (pnpm workspace)
├── pnpm-workspace.yaml            # pnpm workspace konfigürasyonu
├── .gitignore                     # Git ignore dosyası
├── README.md                      # Ana proje dokümantasyonu
├── docs/                          # Dokümantasyon klasörü
│   ├── roadmap-new.md            # Bu roadmap dosyası
│   └── api-documentation.md       # API dokümantasyonu
├── heybe-api/                     # Backend Node.js uygulaması
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # Ana server dosyası
│   │   ├── routes/               # API route'ları
│   │   ├── middleware/           # Express middleware'leri
│   │   ├── database/             # Veritabanı bağlantı ve modelleri
│   │   └── utils/                # Yardımcı fonksiyonlar
│   ├── .env.example              # Environment variables örneği
│   └── nodemon.json              # Development konfigürasyonu
├── heybe-website/                 # Frontend React uygulaması
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx               # Ana uygulama bileşeni
│   │   ├── components/           # React bileşenleri
│   │   │   ├── ui/               # shadcn UI bileşenleri
│   │   │   ├── Sidebar.jsx       # Ana sidebar bileşeni
│   │   │   ├── ProductList.jsx   # Ürün listesi bileşeni
│   │   │   └── AuthModal.jsx     # Giriş/Kayıt modal bileşeni
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Yardımcı fonksiyonlar
│   │   ├── services/             # API servis fonksiyonları
│   │   └── styles/               # CSS/Tailwind stilleri
│   ├── public/                   # Statik dosyalar
│   ├── index.html                # Ana HTML dosyası
│   ├── vite.config.js            # Vite konfigürasyonu
│   ├── tailwind.config.js        # Tailwind konfigürasyonu
│   └── components.json           # shadcn konfigürasyonu
└── heybe-extension/               # Browser extension (WXT)
    ├── package.json
    ├── wxt.config.ts             # WXT konfigürasyonu
    ├── entrypoints/              # Extension entry points
    │   ├── background.ts         # Background script
    │   ├── content.ts            # Content script
    │   └── popup/                # Extension popup
    ├── components/               # React bileşenleri
    │   ├── ui/                   # shadcn UI bileşenleri
    │   ├── ProductButton.tsx     # Ürün ekleme butonu
    │   └── AuthPopup.tsx         # Giriş/Kayıt popup'ı
    ├── utils/                    # Yardımcı fonksiyonlar
    │   ├── storage.ts            # Extension storage yönetimi
    │   ├── productDetection.ts   # Ürün sayfası algılama (GELİŞTİRİLMİŞ)
    │   └── api.ts                # Backend API iletişimi
    └── assets/                   # Statik dosyalar (logolar, ikonlar)
```

### 🌍 Internationalization (i18n) Yapısı

**Desteklenen Diller:**

- 🇹🇷 Türkçe (tr) - Varsayılan
- 🇬🇧 İngilizce (en) - Fallback

**Dil Seçim Stratejisi:**

1. **Varsayılan Dil:** Tarayıcının dili (`navigator.language`)
2. **Fallback:** Desteklenmeyen diller için İngilizce
3. **Kullanıcı Seçimi:** Website'de dil değiştirilirse localStorage'da saklanır
4. **Öncelik Sırası:** localStorage > Browser Language > English

**Website i18n Yapısı:**

```
heybe-website/src/
├── i18n/
│   ├── index.ts              # i18n konfigürasyonu
│   ├── locales/
│   │   ├── tr.json           # Türkçe çeviriler
│   │   └── en.json           # İngilizce çeviriler
│   └── hooks/
│       └── useTranslation.ts # Translation hook
```

**Extension i18n Yapısı:**

```
heybe-extension/
├── locales/
│   ├── tr/
│   │   └── messages.json     # Türkçe çeviriler
│   └── en/
│       └── messages.json     # İngilizce çeviriler
├── utils/
│   └── i18n.ts              # Extension i18n utilities
```

**Sidebar Component (Shadcn UI):**

```
heybe-website/src/components/
├── ui/
│   └── sidebar.tsx           # Shadcn sidebar component
└── app-sidebar.tsx           # Ana sidebar implementation
```

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

// Extension - i18n utility
const getExtensionLanguage = () => {
  // 1. Browser dilini al
  const browserLang = chrome.i18n.getUILanguage().split("-")[0];

  // 2. Desteklenen diller arasında kontrol et
  return ["tr", "en"].includes(browserLang) ? browserLang : "en";
};

const t = (key: string) => {
  return chrome.i18n.getMessage(key) || key;
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

**Önemli Notlar:**

- Tüm UI metinleri çeviri anahtarları ile kodlanacak
- Hard-coded metinler kesinlikle kullanılmayacak
- Extension manifest.json'da default_locale belirtilecek
- Dil değişikliği real-time olarak uygulanacak
- SEO için hreflang meta tagları eklenecek

---

## 🛠️ Teknik Gereksinimler

### Backend (heybe-api) - TAMAMLANDI

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Veritabanı:** PostgreSQL
- **Database Client:** pg (node-postgres)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Environment:** dotenv
- **CORS:** cors middleware
- **Development:** tsc-watch
- **Build:** TypeScript Compiler
- **Paket Yöneticisi:** pnpm

### Frontend (heybe-website)

- **Framework:** React 18+
- **Build Tool:** Vite
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (shadcn default)
- **State Management:** React Context/useState
- **HTTP Client:** fetch API
- **Routing:** React Router (tek sayfa uygulaması)
- **Paket Yöneticisi:** pnpm

### Extension (heybe-extension)

- **Framework:** WXT (webextension-polyfill dahil)
- **UI Framework:** React
- **UI Components:** shadcn/ui (extension uyumlu)
- **Styling:** Tailwind CSS
- **Build Target:** Chrome, Firefox, Safari, Edge, Brave
- **Storage:** Cross-browser storage API (WXT otomatik mapping)
  - Chrome/Edge/Brave: `chrome.storage`
  - Firefox/Safari: `browser.storage`
- **Messaging:** Cross-browser runtime API (WXT otomatik mapping)
  - Chrome/Edge/Brave: `chrome.runtime`
  - Firefox/Safari: `browser.runtime`
- **Polyfill:** webextension-polyfill (WXT varsayılan)
- **Storage Keys:** `currentUuid`, `auth` (GUEST/VERIFIED)
- **Paket Yöneticisi:** pnpm

---

## 🗄️ Veritabanı Şeması

### SQL Script (PostgreSQL)

```sql
-- PostgreSQL Bağlantı Konfigürasyonu
-- connectionString: "postgresql://neondb_owner:npg_THndD7EjqOP5@ep-noisy-mode-a2pgtuyt-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products tablosu
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    price VARCHAR(100),
    image_urls TEXT[], -- Birden fazla resim URL'i için array
    url TEXT NOT NULL,
    site VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_site ON products(site);

-- Trigger for updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 Backend API Endpoints

### Eski Serverless Functionlardan Çevrilecek Endpoint'ler

| Endpoint              | Method | Açıklama                          | Eski Dosya             |
| --------------------- | ------ | --------------------------------- | ---------------------- |
| `/api/auth/register`  | POST   | Kullanıcı kaydı + ürün transferi  | register.js            |
| `/api/auth/login`     | POST   | Kullanıcı girişi + ürün transferi | login.js               |
| `/api/products`       | GET    | Kullanıcının ürünlerini getir     | get-products.js        |
| `/api/products`       | POST   | Yeni ürün ekle                    | add-product.js         |
| `/api/products/:id`   | DELETE | Ürün sil                          | delete-product.js      |
| `/api/products/all`   | DELETE | Tüm ürünleri sil                  | delete-all-products.js |
| `/api/database/setup` | POST   | Veritabanı kurulumu               | setup-database.js      |
| `/api/database/check` | GET    | Veritabanı şema kontrolü          | check-schema.js        |
| `/api/health`         | GET    | API sağlık kontrolü               | test.js                |

### API Endpoint Detayları

#### 1. POST `/api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "guest_user_id": "guest-uuid-123", // Opsiyonel
  "role": "GUEST" // Transfer için gerekli
}
```

#### 2. POST `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "guest_user_id": "guest-uuid-123", // Opsiyonel
  "role": "GUEST" // Transfer için gerekli
}
```

#### 3. POST `/api/products` (Çoklu Resim Desteği)

```json
{
  "user_id": "user-uuid-123",
  "name": "Ürün Adı",
  "price": "99.99 TL",
  "image_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "url": "https://example.com/product",
  "site": "example.com"
}
```

**Backend Implementation:**

```javascript
app.post("/api/products", async (req, res) => {
  const { user_id, name, price, image_urls, url, site } = req.body;

  try {
    // image_urls array'ini PostgreSQL array formatına çevir
    const imageUrlsArray = Array.isArray(image_urls)
      ? image_urls
      : [image_urls].filter(Boolean);

    const result = await pool.query(
      "INSERT INTO products (user_id, name, price, image_urls, url, site) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [user_id, name, price, imageUrlsArray, url, site]
    );

    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error("Ürün ekleme hatası:", error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🎨 Frontend Bileşenleri

### Ana Bileşen Yapısı (HTML-First, CSS-Second, TypeScript-Last)

#### 1. App.tsx (Ana Uygulama)

- **HTML-First:** Semantic HTML5 structure with proper landmarks
- **CSS-Second:** CSS Grid/Flexbox layout, CSS custom properties
- **TypeScript-Last:** Sidebar state yönetimi, Global user context
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
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <span className="font-bold text-sm">H</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Heybe</span>
                    <span className="truncate text-xs">
                      {t("products.myProducts") || "Ürünlerim"}
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("common.menu") || "Menü"}</SidebarGroupLabel>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton tooltip={item.title} onClick={item.action}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
                      <AvatarImage src="" alt={isLoggedIn ? "User" : "Guest"} />
                      <AvatarFallback className="rounded-lg">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {isLoggedIn
                          ? t("auth.loggedIn") || "Giriş Yapıldı"
                          : t("auth.guest") || "Misafir"}
                      </span>
                      <span className="truncate text-xs">
                        {currentUserId
                          ? `${currentUserId.substring(0, 8)}...`
                          : t("auth.guestUser") || "Misafir Kullanıcı"}
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
                  {/* Language Selection */}
                  <DropdownMenuItem
                    onClick={() =>
                      onLanguageChange(currentLanguage === "tr" ? "en" : "tr")
                    }
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {currentLanguage === "tr" ? "🇬🇧 English" : "🇹🇷 Türkçe"}
                  </DropdownMenuItem>

                  <Separator className="my-1" />

                  {/* Auth Actions */}
                  {!isLoggedIn ? (
                    <DropdownMenuItem onClick={() => setAuthModalOpen(true)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t("auth.loginRegister") || "Giriş / Kayıt"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("auth.logout") || "Çıkış Yap"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
    </>
  );
}
```

**Layout.tsx - Ana Layout Bileşeni:**

```typescript
// components/Layout.tsx - Sidebar-07 ile entegre layout
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";

type LayoutProps = {
  readonly children: React.ReactNode;
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

export function Layout({
  children,
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
}: LayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar
        onScrollToSection={onScrollToSection}
        currentUserId={currentUserId}
        userRole={userRole}
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        t={t}
      />
      <main className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          {/* Breadcrumb kaldırıldı - kullanıcı talebi */}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
```

**Shadcn Renk Teması (globals.css):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.65rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.141 0.005 285.823);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.141 0.005 285.823);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.141 0.005 285.823);
    --primary: oklch(0.606 0.25 292.717);
    --primary-foreground: oklch(0.969 0.016 293.756);
    --secondary: oklch(0.967 0.001 286.375);
    --secondary-foreground: oklch(0.21 0.006 285.885);
    --muted: oklch(0.967 0.001 286.375);
    --muted-foreground: oklch(0.552 0.016 285.938);
    --accent: oklch(0.967 0.001 286.375);
    --accent-foreground: oklch(0.21 0.006 285.885);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.92 0.004 286.32);
    --input: oklch(0.92 0.004 286.32);
    --ring: oklch(0.606 0.25 292.717);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.141 0.005 285.823);
    --sidebar-primary: oklch(0.606 0.25 292.717);
    --sidebar-primary-foreground: oklch(0.969 0.016 293.756);
    --sidebar-accent: oklch(0.967 0.001 286.375);
    --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
    --sidebar-border: oklch(0.92 0.004 286.32);
    --sidebar-ring: oklch(0.606 0.25 292.717);
  }

  .dark {
    --background: oklch(0.141 0.005 285.823);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.21 0.006 285.885);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.21 0.006 285.885);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.541 0.281 293.009);
    --primary-foreground: oklch(0.969 0.016 293.756);
    --secondary: oklch(0.274 0.006 286.033);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.274 0.006 286.033);
    --muted-foreground: oklch(0.705 0.015 286.067);
    --accent: oklch(0.274 0.006 286.033);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.541 0.281 293.009);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.21 0.006 285.885);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.541 0.281 293.009);
    --sidebar-primary-foreground: oklch(0.969 0.016 293.756);
    --sidebar-accent: oklch(0.274 0.006 286.033);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.541 0.281 293.009);
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

**Özellikler:**

- **Responsive Design:** Otomatik collapse/expand
- **Accessibility:** ARIA labels, keyboard navigation
- **Modern UI:** Shadcn tasarım sistemi
- **Collapsible:** Sidebar açılıp kapanabilir
- **Content Adaptation:** İçerik sidebar durumuna göre ayarlanır
- **No Breadcrumb:** Kullanıcı talebi doğrultusunda breadcrumb kaldırıldı

#### 3. ProductList.tsx

- **Semantic HTML:** `<main>`, `<section>`, `<article>` for products
- **CSS Grid:** Responsive product grid layout
- **Progressive Enhancement:** Search works with CSS `:has()` selector
- **Arama Barı:** Client-side ürün filtreleme
- **İstatistikler:** Toplam ürün + site sayısı
- **Ürün Satırları:**
  - Sol: Ürün resmi (çoklu resim desteği)
  - Orta: Ürün adı + site domain
  - Sağ: Yönlendirme + Silme butonları
- **Boş Durum:** Semantic empty state with proper messaging
- **Çoklu Resim:** Native `<picture>` element with responsive images

#### 4. AuthModal.tsx

```typescript
// components/AuthModal.tsx - Shadcn Dialog ile modern auth modal
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type AuthModalProps = {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  readonly onRegister: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  readonly isLoading?: boolean;
};

export function AuthModal({
  isOpen,
  onOpenChange,
  onLogin,
  onRegister,
  isLoading = false,
}: AuthModalProps) {
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await onLogin(loginData.email, loginData.password);
      if (result.success) {
        onOpenChange(false);
        setLoginData({ email: "", password: "" });
      } else {
        setError(result.message || t("auth.loginFailed"));
      }
    } catch (err) {
      setError(t("common.error"));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await onRegister(
        registerData.email,
        registerData.password
      );
      if (result.success) {
        onOpenChange(false);
        setRegisterData({ email: "", password: "" });
      } else {
        setError(result.message || t("auth.registerFailed"));
      }
    } catch (err) {
      setError(t("common.error"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("auth.accountOperations")}</DialogTitle>
          <DialogDescription>{t("auth.loginOrRegister")}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              {t("auth.login")}
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t("auth.register")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.login")}</CardTitle>
                <CardDescription>
                  {t("auth.loginWithExistingAccount")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.loggingIn")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.register")}</CardTitle>
                <CardDescription>{t("auth.createNewAccount")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t("auth.email")}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      {t("auth.password")}
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.registering")}
                      </>
                    ) : (
                      t("auth.register")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

**Özellikler:**

- **Shadcn Dialog:** Modern modal yapısı ve focus trap
- **Tabs Component:** Login/Register arası geçiş
- **Form Validation:** HTML5 validation + TypeScript
- **Loading States:** Spinner ve disabled durumlar
- **Error Handling:** Alert komponenti ile hata gösterimi
- **Accessibility:** Proper labels, ARIA attributes
- **Responsive:** Mobile-first tasarım
- **Transfer Logic:** Misafir ürünlerinin transferi backend'de

#### 5. InstallationModal.tsx

- **Semantic Structure:** `<dialog>` element with proper roles
- **CSS Animations:** Smooth transitions without JavaScript
- **Progressive Disclosure:** CSS-based step navigation
- **Eklenti Durumu:** Yüklü/Yüklü değil kontrolü
- **Tarayıcı Algılama:** CSS `@supports` for feature detection
- **Yönlendirme:** İlgili extension store linkler

#### 6. ExtensionWarning.tsx

```typescript
// components/ExtensionWarning.tsx - Shadcn Alert ile modern uyarı banner
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Download, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ExtensionWarningProps = {
  readonly isExtensionInstalled: boolean;
  readonly onInstallClick: () => void;
  readonly className?: string;
};

export function ExtensionWarning({
  isExtensionInstalled,
  onInstallClick,
  className,
}: ExtensionWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Extension kurulu değilse ve daha önce kapatılmamışsa göster
    const dismissed = localStorage.getItem("extension-warning-dismissed");
    if (!isExtensionInstalled && !dismissed) {
      setIsVisible(true);
    }
  }, [isExtensionInstalled]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("extension-warning-dismissed", "true");
  };

  const handleInstallClick = () => {
    onInstallClick();
    handleDismiss(); // Kurulum sayfasına yönlendirildikten sonra banner'ı kapat
  };

  // Extension kuruluysa veya kapatıldıysa gösterme
  if (isExtensionInstalled || isDismissed || !isVisible) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className={cn(
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
        "sticky top-0 z-50 rounded-none border-x-0 border-t-0",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium">Eklenti bulunamadı!</span>
          <span className="text-sm">
            Yeni ürün eklemek için eklentiyi yüklemeniz gerekiyor.
          </span>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInstallClick}
            className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800"
          >
            <Download className="h-3 w-3 mr-1" />
            Eklentiyi Yükle
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900"
            aria-label="Uyarıyı kapat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

**Özellikler:**

- **Shadcn Alert:** Modern alert komponenti yapısı
- **Sticky Banner:** Sayfanın üstünde sabit kalır
- **Dismissible:** Kapatılabilir ve localStorage'da hatırlanır
- **Accessibility:** ARIA attributes ve screen reader desteği
- **Dark Mode:** Otomatik dark mode desteği
- **Responsive:** Mobile-first tasarım
- **Icon Integration:** Lucide React ikonları
- **CTA Button:** Kurulum sayfasına yönlendirme
- **Auto-hide:** Extension kurulduğunda otomatik gizlenir
- **Graceful Degradation:** JavaScript olmadan da çalışır

#### TypeScript Type Definitions

```typescript
// types/index.ts - Strict typing with template literals
type ProductId = `product_${string}`;
type UserId = `user_${string}` | `guest_${string}`;
type SiteUrl = `https://${string}` | `http://${string}`;

type Product = {
  readonly id: ProductId;
  readonly name: string;
  readonly price: string;
  readonly image_urls: readonly string[];
  readonly url: SiteUrl;
  readonly site: string;
  readonly created_at: string;
};

type UserData = {
  readonly userType: "guest" | "registered";
  readonly userId: UserId;
  readonly email?: string;
};

// API response types with branded strings
type ApiResponse<T> = {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
};

type ProductApiResponse = ApiResponse<{
  readonly product: Product;
  readonly count: number;
}>;
```

#### Modern React Components with TypeScript

```typescript
// components/ProductList.tsx - Performance optimized with i18n
import { memo, useMemo, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Product } from "@/types";

type ProductListProps = {
  readonly products: readonly Product[];
  readonly onDeleteProduct: (id: ProductId) => Promise<void>;
  readonly searchQuery: string;
};

const ProductList = memo(function ProductList({
  products,
  onDeleteProduct,
  searchQuery,
}: ProductListProps) {
  const { t } = useTranslation();

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.site.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Memoized delete handler
  const handleDeleteProduct = useCallback(
    async (productId: ProductId) => {
      try {
        await onDeleteProduct(productId);
      } catch (error) {
        console.error("Product deletion failed:", error);
      }
    },
    [onDeleteProduct]
  );

  if (filteredProducts.length === 0) {
    return (
      <section
        className="flex flex-col items-center justify-center p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold text-gray-700">
          {searchQuery
            ? t("products.noSearchResults") || "Arama sonucu bulunamadı"
            : t("products.noProducts") || "Henüz ürün eklenmemiş"}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {searchQuery
            ? t("products.tryDifferentKeywords") ||
              "Farklı anahtar kelimeler deneyin"
            : t("products.addFirstProduct") || "İlk ürününüzü ekleyin"}
        </p>
      </section>
    );
  }

  return (
    <main className="space-y-4 p-4">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          {t("products.myProducts") || "Ürünlerim"}
        </h1>
        <div className="text-sm text-gray-600">
          {filteredProducts.length} {t("products.product") || "ürün"} •{" "}
          {new Set(filteredProducts.map((p) => p.site)).size}{" "}
          {t("products.site") || "site"}
        </div>
      </header>

      <ul className="space-y-3" role="list">
        {filteredProducts.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
          />
        ))}
      </ul>
    </main>
  );
});

export { ProductList };
```

```typescript
// hooks/useExtensionStorage.ts - Custom hook with proper error handling
import { useCallback, useEffect, useState } from "react";
import type { Product, UserData } from "@/types";

type ExtensionStorageHook = {
  readonly products: readonly Product[];
  readonly userData: UserData | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly addProduct: (
    product: Omit<Product, "id" | "created_at">
  ) => Promise<void>;
  readonly deleteProduct: (id: ProductId) => Promise<void>;
  readonly syncWithWebsite: () => Promise<void>;
};

function useExtensionStorage(): ExtensionStorageHook {
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const [productsData, userDataResult] = await Promise.all([
          browser.storage.local.get("products"),
          browser.storage.local.get("userData"),
        ]);

        setProducts(productsData.products || []);
        setUserData(userDataResult.userData || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Storage load failed");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addProduct = useCallback(
    async (productData: Omit<Product, "id" | "created_at">): Promise<void> => {
      try {
        const newProduct: Product = {
          ...productData,
          id: `product_${crypto.randomUUID()}` as ProductId,
          created_at: new Date().toISOString(),
        };

        const updatedProducts = [...products, newProduct];
        await browser.storage.local.set({ products: updatedProducts });
        setProducts(updatedProducts);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Product add failed"
        );
      }
    },
    [products]
  );

  const deleteProduct = useCallback(
    async (productId: ProductId): Promise<void> => {
      try {
        const updatedProducts = products.filter((p) => p.id !== productId);
        await browser.storage.local.set({ products: updatedProducts });
        setProducts(updatedProducts);
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Product delete failed"
        );
      }
    },
    [products]
  );

  const syncWithWebsite = useCallback(async (): Promise<void> => {
    try {
      // Send storage change notification to website
      await browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs[0]?.id) {
            return browser.tabs.sendMessage(tabs[0].id, {
              type: "HEYBE_STORAGE_UPDATED",
              data: { products, userData },
            });
          }
        });
    } catch (err) {
      console.warn("Website sync failed:", err);
      // Non-critical error, don't throw
    }
  }, [products, userData]);

  return {
    products,
    userData,
    isLoading,
    error,
    addProduct,
    deleteProduct,
    syncWithWebsite,
  };
}

export { useExtensionStorage };
```

---

## 🧩 Extension Özellikleri

### Desteklenen Tarayıcılar

- **Chrome** ✅ (WXT native support)
- **Firefox** ✅ (WXT native support)
- **Edge** ✅ (Chromium-based, Chrome ile uyumlu)
- **Brave** ✅ (Chromium-based, Chrome ile uyumlu)
- **Safari** ⚠️ (WXT experimental support - alternatif yaklaşım gerekebilir)

### Safari İçin Alternatif Yaklaşım

Safari için WXT tam destek vermiyorsa:

1. **Safari Web Extension Converter** kullanımı
2. **Manuel Safari extension** geliştirme
3. **Progressive Web App (PWA)** alternatifi

### Ürün Sayfası Algılama Algoritması (Geliştirilmiş)

```typescript
// productDetection.ts - Geliştirilmiş ürün sayfası algılama algoritması

// 1. Ana sayfa kontrolü (İlk kontrol)
const isHomePage = (): boolean => {
  const homePageIndicators = [
    window.location.pathname === "/",
    window.location.pathname === "/home",
    window.location.pathname === "/anasayfa",
    window.location.pathname === "/index",
    document.title.toLowerCase().includes("ana sayfa"),
    document.title.toLowerCase().includes("homepage"),
    document.title.toLowerCase().includes("anasayfa"),
    document.title.toLowerCase().includes("home page"),
    // URL'de ana sayfa göstergeleri
    window.location.href.match(/\/(home|anasayfa|index)(\/|\?|#|$)/i),
    // Meta tag kontrolü
    document.querySelector('meta[property="og:type"][content="website"]'),
    document.querySelector('meta[name="robots"][content*="index"]')
  ];

  return homePageIndicators.some(indicator => indicator);
};

// 2. Sepete ekle butonu kontrolü (Ana kontrol)
const checkAddToCartButton = (): { hasButton: boolean; buttonCount: number; topButton: Element | null } => {
  // Tüm olası sepete ekle buton seçicileri
  const buttonSelectors = "button, a, input[type='button'], input[type='submit'], div[role='button'], span[role='button'], [class*='button'], [class*='btn'], [data-testid*='button'], [data-testid*='cart'], [data-testid*='add']";
  const allElements = Array.from(document.querySelectorAll(buttonSelectors));

  // Sepete ekle metinleri (çoklu dil desteği)
  const addToCartTexts = [
    // Türkçe
    "sepete ekle", "sepet", "sepete at", "sepete koy", "satın al", "hemen al", "şimdi al",
    // İngilizce
    "add to cart", "add to bag", "buy now", "purchase", "order now", "add to basket",
    "buy", "cart", "checkout", "add item", "add product",
    // Diğer diller
    "kaufen", "in den warenkorb", "acheter", "ajouter au panier", "comprar", "añadir al carrito",
    "acquista", "aggiungi al carrello", "koop", "toevoegen aan winkelwagen",
    // Kısaltmalar ve semboller
    "add +", "+ cart", "🛒", "🛍️"
  ];

  const addToCartButtons = allElements.filter(element => {
    const text = (
      element.textContent ||
      element.getAttribute('value') ||
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.getAttribute('alt') ||
      ''
    ).toLowerCase().trim();

    return addToCartTexts.some(term => text.includes(term.toLowerCase()));
  });

  // En üstteki butonu bul (viewport'a göre)
  let topButton: Element | null = null;
  let minTop = Infinity;

  addToCartButtons.forEach(button => {
    const rect = button.getBoundingClientRect();
    if (rect.top < minTop && rect.top >= 0) {
      minTop = rect.top;
      topButton = button;
    }
  });

  return {
    hasButton: addToCartButtons.length > 0,
    buttonCount: addToCartButtons.length,
    topButton
  };
};

// 3. Meta tag ile ürün sayfası doğrulaması
const isProductDetailPage = (): boolean => {
  const productMetaTags = [
    'meta[property="og:type"][content="product"]',
    'meta[property="product:price:amount"]',
    'meta[property="product:price:currency"]',
    'meta[name="twitter:data1"]',
    'meta[name="twitter:label1"]',
    'meta[property="product:availability"]',
    'meta[property="product:condition"]',
    'meta[property="product:brand"]',
    'meta[property="product:category"]',
    'meta[name="product_id"]',
    'meta[name="shopify-product-id"]',
    'meta[property="product:retailer_item_id"]',
    'meta[name="woocommerce-product-id"]',
    'meta[name="title"]',
    'meta[property="product:name"]',
    'meta[property="product:title"]'
  ];

  return productMetaTags.some(selector => document.querySelector(selector));
};

// 4. Butonun yerleşim kontrolü (son kontrol)
const checkButtonPlacement = (button: Element): boolean => {
  if (!button) return false;

  const rect = button.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Buton sayfanın üst yarısında mı?
  const isInTopHalf = rect.top < (viewportHeight / 2);

  if (!isInTopHalf) return false;

  // Butonun çevresinde başka sepete ekle butonu var mı kontrol et
  const parentElement = button.parentElement;
  if (!parentElement) return true;

  // 3 seviye yukarı çık ve çevredeki elementleri kontrol et
  let checkElement = parentElement;
  for (let i = 0; i < 3; i++) {
    if (!checkElement.parentElement) break;
    checkElement = checkElement.parentElement;
  }

  // Çevredeki sepete ekle butonlarını say
  const nearbyButtons = checkElement.querySelectorAll('button, a, [role="button"]');
  const addToCartTexts = ["sepete ekle", "add to cart", "buy", "satın al", "sepet", "cart"];

  let nearbyAddToCartCount = 0;
  nearbyButtons.forEach(btn => {
    if (btn === button) return; // Kendisini sayma

    const text = (btn.textContent || '').toLowerCase();
    if (addToCartTexts.some(term => text.includes(term))) {
      nearbyAddToCartCount++;
    }
  });

  // Çevrede 2'den fazla sepete ekle butonu varsa bu muhtemelen ürün listesi
  return nearbyAddToCartCount <= 2;
};

// 5. URL'den ürün adı çıkarma (tire ile ayrılmış)
const extractProductNameFromUrl = (): string => {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(segment => segment.length > 0);

  // URL'de tire ile ayrılmış ürün adı arama (en uzun segmenti tercih et)
  let bestSegment = "";

  for (const segment of segments) {
    // Tire içeren, yeterince uzun ve sayısal olmayan segmentleri değerlendir
    if (segment.includes('-') &&
        segment.length > 10 &&
        segment.length > bestSegment.length &&
        !/^\d+$/.test(segment.replace(/-/g, ''))) {
      bestSegment = segment;
    }
  }

  if (!bestSegment) return "";

  // Tire ile ayrılmış metni boşluklara çevir ve temizle
  return bestSegment
    .split('-')
    .filter(word => word.length > 1 && !/^\d+$/.test(word)) // Tek karakter ve sadece sayıları filtrele
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]/g, '')
    .trim();
};

// Algoritma Özeti:
// 1. Ana sayfa kontrolü → Eğer ana sayfaysa FALSE döndür
// 2. Sepete ekle butonu arama → Bulunamazsa FALSE döndür
// 3. Meta tag doğrulaması → Varsa TRUE döndür
// 4. Son kontrol: Tek buton + üst yerleşim + çevrede az buton → TRUE döndür
// 5. Diğer durumlar → FALSE döndür

// 6. DOM'da URL tabanlı ürün adı arama
const findProductNameInDOM = (urlProductName: string): string => {
  if (!urlProductName) return "";

  // URL'den çıkarılan ürün adının DOM'da eşleşmesini ara
  const searchTerms = urlProductName.toLowerCase().split(' ').filter(term => term.length > 2);
  const allTextElements = document.querySelectorAll(
    'h1, h2, h3, title, [class*="title"], [class*="name"], [class*="product"], [class*="baslik"], [data-testid*="title"], [data-testid*="name"]'
  );

  let bestMatch = "";
  let bestScore = 0;

  for (const element of allTextElements) {
    const text = element.textContent?.toLowerCase() || "";

    // Kelime eşleşme skorunu hesapla
    const matchCount = searchTerms.filter(term => text.includes(term)).length;
    const score = matchCount / searchTerms.length;

    // En az %60 eşleşme arıyoruz ve en iyi skoru kaydet
    if (score >= 0.6 && score > bestScore) {
      bestScore = score;
      bestMatch = element.textContent?.trim() || "";
    }
  }

  return bestMatch;
};

// Ana tespit fonksiyonu (Geliştirilmiş Algoritma)
export const detectProductPage = (): boolean => {
  // 1. ADIM: Ana sayfa kontrolü (İlk ve en önemli kontrol)
  if (isHomePage()) {
    console.log('Heybe: Ana sayfa tespit edildi, ürün sayfası değil');
    return false;
  }

  // 2. ADIM: Sepete ekle butonu arama
  const addToCartResult = checkAddToCartButton();

  if (!addToCartResult.hasButton) {
    console.log('Heybe: Sepete ekle butonu bulunamadı');
    return false;
  }

  console.log(`Heybe: ${addToCartResult.buttonCount} adet sepete ekle butonu bulundu`);

  // 3. ADIM: Meta tag ile doğrulama
  const hasProductMeta = isProductDetailPage();

  if (hasProductMeta) {
    console.log('Heybe: Meta tag doğrulaması başarılı - Ürün sayfası tespit edildi');
    return true;
  }

  console.log('Heybe: Meta tag doğrulaması başarısız - Son kontrol yapılıyor');

  // 4. ADIM: Son kontrol - Butonun yerleşimi ve teklik kontrolü
  if (addToCartResult.buttonCount === 1 && addToCartResult.topButton) {
    const isWellPlaced = checkButtonPlacement(addToCartResult.topButton);

    if (isWellPlaced) {
      console.log('Heybe: Tek sepete ekle butonu üst kısımda ve iyi yerleştirilmiş - Ürün sayfası olarak kabul edildi');
      return true;
    }
  }

  // Birden fazla buton varsa ve meta tag yoksa, muhtemelen ürün listesi
  if (addToCartResult.buttonCount > 1) {
    console.log(`Heybe: ${addToCartResult.buttonCount} sepete ekle butonu var ama meta tag yok - Muhtemelen ürün listesi`);
    return false;
  }

  console.log('Heybe: Ürün sayfası kriterleri karşılanmadı');
  return false;
};

// Fiyat elementi kontrolü (Opsiyonel - ek doğrulama için)
const checkPriceElement = (): boolean => {
  const priceSelectors = [
    '[class*="price"]', '[class*="fiyat"]', '[class*="cost"]',
    '[class*="amount"]', '[data-testid*="price"]', '.currency',
    '[class*="money"]', '[class*="para"]', '[class*="preis"]',
    '[class*="tutar"]', '[class*="ucret"]', '[class*="bedel"]'
  ];

  return priceSelectors.some(selector => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).some(element => {
      const text = element.textContent?.trim() || "";
      const priceRegex = /[\d.,]+\s*(₺|TL|\$|€|USD|EUR|£|¥|₽|₹|₩|₪|₦|₡|₨|₫|₭|₮|₯|₰|₱|₲|₳|₴|₵|₶|₷|₸|₹|₺)/i;
      return priceRegex.test(text);
    });
  });
};

// 7. Gelişmiş ürün bilgisi çıkarma (Yeni Algoritma)
export const extractProductInfo = () => {
  // Meta tagları topla
  const metaTags: Record<string, string> = {};
  document.querySelectorAll("meta").forEach(meta => {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    const content = meta.getAttribute("content");
    if (name && content) {
      metaTags[name.toLowerCase()] = content;
    }
  });

  // 1. Meta taglerden ürün adı (en yüksek öncelik)
  const metaProductName =
    metaTags["og:title"] ||
    metaTags["twitter:title"] ||
    metaTags["product:name"] ||
    metaTags["product:title"] ||
    metaTags["item:name"] ||
    metaTags.title ||
    "";

  // 2. URL tabanlı ürün adı tespiti
  const urlProductName = extractProductNameFromUrl();
  const domProductName = findProductNameInDOM(urlProductName);

  // 3. H1 taginden ürün adı alma (ek kaynak)
  const h1ProductName = document.querySelector('h1')?.textContent?.trim() || "";

  // 4. Gelişmiş ürün adı seçimi - Öncelik ve kalite tabanlı
  const siteDomain = window.location.hostname.toLowerCase();
  const domainKeywords = siteDomain.split('.')[0]; // trendyol.com -> trendyol

  let finalProductName = "Ürün";

  // Tüm adayları öncelik sırasıyla topla
  const candidates = [
    { name: metaProductName, priority: 4, source: 'meta' },
    { name: domProductName, priority: 3, source: 'dom' },
    { name: h1ProductName, priority: 2, source: 'h1' },
    { name: urlProductName, priority: 1, source: 'url' }
  ].filter(candidate => candidate.name && candidate.name.length > 3);

  if (candidates.length === 0) {
    // Fallback: Sayfa başlığından al
    const titleParts = document.title.split(/[|\-–—]/)[0].trim();
    finalProductName = titleParts.length > 3 ? titleParts : "Ürün";
  } else {
    // Domain adı kontrolü ve en iyi adayı seçme
    const withoutDomain = candidates.filter(c =>
      !c.name.toLowerCase().includes(domainKeywords)
    );

    const finalCandidates = withoutDomain.length > 0 ? withoutDomain : candidates;

    // En yüksek öncelikli ve en uzun olanı seç
    finalProductName = finalCandidates.reduce((best, current) => {
      if (current.priority > best.priority) return current;
      if (current.priority === best.priority && current.name.length > best.name.length) return current;
      return best;
    }).name;
  }

  // Fiyat çıkarma
  const price =
    metaTags["product:price:amount"] ||
    metaTags["twitter:data1"] ||
    metaTags["product:price"] ||
    extractPriceFromDOM();

  // Resim URL'leri
  const primaryImageUrl =
    metaTags["og:image"] ||
    metaTags["twitter:image"] ||
    metaTags["product:image"] ||
    metaTags.image ||
    "";

  const secondaryImageUrl = findLargerProductImage();

  const imageUrls = [primaryImageUrl];
  if (secondaryImageUrl && secondaryImageUrl !== primaryImageUrl) {
    imageUrls.push(secondaryImageUrl);
  }

  return {
    name: finalProductName,
    price: price || "",
    image_urls: imageUrls.filter(url => url && url.length > 0),
    url: window.location.href,
    site: window.location.hostname
  };
};

// URL'den ürün adı çıkarma fonksiyonu
const extractProductNameFromUrl = (): string => {
  try {
    const url = window.location.href;
    const pathname = window.location.pathname;

    // URL'den tire ile ayrılmış kısımları çıkar
    const urlParts = pathname.split('/').filter(part => part.length > 0);

    // En uzun ve en çok tire içeren kısmı bul (genelde ürün adı)
    let productNameCandidate = '';

    for (const part of urlParts) {
      if (part.includes('-') && part.length > productNameCandidate.length) {
        productNameCandidate = part;
      }
    }

    if (!productNameCandidate) {
      return '';
    }

    // Tire ile ayrılmış kelimeleri birleştir
    const words = productNameCandidate
      .split('-')
      .filter(word => word.length > 1) // Tek harfli kelimeleri filtrele
      .filter(word => !/^\d+$/.test(word)) // Sadece rakam olan kısımları filtrele
      .map(word => {
        // İlk harfi büyük yap
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });

    return words.join(' ').trim();
  } catch (error) {
    console.error('URL\'den ürün adı çıkarma hatası:', error);
    return '';
  }
};

// DOM'da URL'den çıkarılan ürün adını arama
const findProductNameInDOM = (urlProductName: string): string => {
  if (!urlProductName || urlProductName.length < 3) {
    return '';
  }

  try {
    // Arama yapılacak elementler (öncelik sırasına göre)
    const searchSelectors = [
      'h1', // En yüksek öncelik
      '[class*="product-title" i]',
      '[class*="product-name" i]',
      '[id*="product-title" i]',
      '[id*="product-name" i]',
      'h2',
      '[class*="title" i]',
      '[class*="name" i]',
      'h3'
    ];

    // URL'den çıkarılan kelimeleri hazırla
    const urlWords = urlProductName.toLowerCase().split(' ');
    const minMatchWords = Math.max(2, Math.floor(urlWords.length * 0.6)); // En az %60 eşleşme

    for (const selector of searchSelectors) {
      const elements = document.querySelectorAll(selector);

      for (const element of elements) {
        const text = element.textContent?.trim() || '';

        if (text.length < 10 || text.length > 200) {
          continue; // Çok kısa veya çok uzun metinleri atla
        }

        // Metin temizleme
        const cleanText = text
          .toLowerCase()
          .replace(/[^a-zA-ZğüşıöçĞÜŞIÖÇ0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Kelime eşleşmesi kontrolü
        const textWords = cleanText.split(' ');
        let matchCount = 0;

        for (const urlWord of urlWords) {
          if (urlWord.length > 2) { // Çok kısa kelimeleri atla
            for (const textWord of textWords) {
              // Tam eşleşme veya benzerlik kontrolü
              if (textWord.includes(urlWord) || urlWord.includes(textWord)) {
                matchCount++;
                break;
              }

              // UTF-8 karakter dönüşümü kontrolü (ç->c, ş->s, vb.)
              const normalizedTextWord = normalizeText(textWord);
              const normalizedUrlWord = normalizeText(urlWord);

              if (normalizedTextWord.includes(normalizedUrlWord) ||
                  normalizedUrlWord.includes(normalizedTextWord)) {
                matchCount++;
                break;
              }
            }
          }
        }

        // Yeterli eşleşme varsa bu metni döndür
        if (matchCount >= minMatchWords) {
          return text.trim();
        }
      }
    }

    return ''; // Eşleşme bulunamadı

  } catch (error) {
    console.error('DOM\'da ürün adı arama hatası:', error);
    return '';
  }
};

// Metin normalleştirme (Türkçe karakterler için)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}
};

// DOM'dan fiyat çıkarma
const extractPriceFromDOM = (): string => {
  const priceSelectors = [
    '[class*="price"]', '[class*="fiyat"]', '[class*="cost"]',
    '[class*="amount"]', '[class*="money"]', '[class*="para"]',
    'span', 'div', 'p'
  ];

  for (const selector of priceSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent?.trim() || "";
      const priceMatch = text.match(/[\d.,]+\s*(₺|TL|\$|€|USD|EUR)/i);
      if (priceMatch) {
        return priceMatch[0];
      }
    }
  }
  return "";
};

// Büyük ürün resmi bulma
const findLargerProductImage = (): string => {
  const images = Array.from(document.querySelectorAll("img"));

  const productImages = images
    .filter(img => {
      const src = img.src || img.getAttribute("data-src") || "";
      const alt = img.alt?.toLowerCase() || "";

      return src.length > 50 &&
             !src.includes("logo") &&
             !src.includes("icon") &&
             !src.includes("avatar") &&
             !alt.includes("logo") &&
             img.width > 100 &&
             img.height > 100;
    })
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));

  return productImages[0]?.src || productImages[0]?.getAttribute("data-src") || "";
};
```

### Ürün Ekleme Butonu Tasarımı

#### Buton Yapısı (Tailwind CSS)

CSS artık kullanılmayacak, tüm stiller Tailwind CSS ile React component içinde tanımlanacak:

```tsx
// Tailwind classes ile styling
const buttonClasses = {
  container:
    "fixed right-0 top-1/2 -translate-y-1/2 z-[10000] transition-transform duration-300 translate-x-full hover:translate-x-0",
  wrapper: "flex shadow-lg rounded-l-lg overflow-hidden",
  addButton:
    "rounded-none rounded-l-lg px-4 py-3 h-12 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2",
  viewButton:
    "rounded-none rounded-r-lg px-4 py-3 h-12 bg-blue-600 hover:bg-blue-700 flex items-center gap-2",
  progressBar:
    "absolute bottom-0 left-0 h-1 bg-green-500 animate-pulse rounded-b-lg w-full",
};
```

#### Buton Tasarımı (Proje Promptuna Göre)

**Buton 2 parçaya bölünmüş olacak:**

- **Sol Kısım:** Heybe logosu (küçük)
- **Sağ Kısım:** "Heybeye Ekle" metni

#### Animasyon Durumları

1. **Normal:** Logo + "Heybeye Ekle" (2 parçalı tasarım)
2. **Loading:** Spinner + "Ekleniyor..." (tek parça, disabled)
3. **Success:** Yeşil tik + "Ürün Eklendi" + Progress bar (2 saniye)
4. **Error:** Kırmızı X + "Hata!" + Toast mesajı
5. **Liste Modu:** Liste ikonu + "Ürünleri Gör" (ürün eklenmiş sayfalarda)

### Heybe'ye Ekle Butonu Akış Şeması

```mermaid
flowchart TD
    Start[Sayfa yüklendi] --> Check{Ürün sayfası mı?}
    Check -->|Hayır| Hide[Buton gizli kalır]
    Check -->|Evet| Show[Buton görünür olur]

    Show --> A[Kullanıcı 'Heybeye Ekle' butonuna basar]
    A --> B[Ürün bilgilerini çıkar]
    B --> C[Buton durumunu 'Ekleniyor...' yap]
    C --> D{Kullanıcı giriş yapmış mı?}

    D -->|Hayır - Misafir| E[Guest UUID al/oluştur]
    D -->|Evet - Kayıtlı| F[Registered User ID al]

    E --> G[API: POST /api/products (guest_user_id)]
    F --> H[API: POST /api/products (registered_user_id)]

    G --> I{API başarılı mı?}
    H --> I

    I -->|Evet| J[Extension storage'a ürün ekle]
    I -->|Hayır| K[Hata mesajı göster]

    J --> L[Website'e storage değişikliği bildir]
    L --> M[Buton: 'Ürün Eklendi' (2 saniye)]
    M --> N[Buton normal duruma dön]

    K --> O[Buton: 'Hata!' (2 saniye)]
    O --> N
```

### Heybe'ye Ekle Butonu - Kod Implementasyonu

**Not:** Bu implementasyon WXT framework'ü ile React ve shadcn/ui bileşenleri kullanılarak geliştirilecektir. Aşağıdaki kod örnekleri modern React patterns ve shadcn/ui component library'sini kullanmaktadır.

#### React Component Yapısı (WXT + React + shadcn/ui)

```tsx
// components/HeybeButton.tsx - React component with shadcn/ui
import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Check, X, Plus, List } from 'lucide-react'
import { cn } from '@/lib/utils'

// i18n utility for extension
const t = (key: string): string => {
  return chrome.i18n.getMessage(key) || key
}

type ButtonState = 'normal' | 'loading' | 'success' | 'error'

interface ProductInfo {
  readonly name: string
  readonly price: string
  readonly image_urls: readonly string[]
  readonly url: string
  readonly site: string
}

interface HeybeButtonProps {
  className?: string
  onProductAdd?: (product: ProductInfo) => void
}

export function HeybeButton({ className, onProductAdd }: HeybeButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('normal')
  const [isVisible, setIsVisible] = useState(false)

  // Buton durumu konfigürasyonu (i18n ile)
  const getButtonConfig = useCallback((state: ButtonState) => {
    const configs = {
      normal: {
        icon: <Plus className="w-4 h-4" />,
        text: t('extension_addToHeybe') || 'Heybeye Ekle',
        disabled: false,
        variant: 'default' as const
      },
      loading: {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: t('extension_adding') || 'Ekleniyor...',
        disabled: true,
        variant: 'default' as const
      },
      success: {
        icon: <Check className="w-4 h-4" />,
        text: t('extension_productAdded') || 'Ürün Eklendi',
        disabled: true,
        variant: 'default' as const
      },
      error: {
        icon: <X className="w-4 h-4" />,
        text: t('extension_error') || 'Hata!',
        disabled: true,
        variant: 'destructive' as const
      }
    }
    return configs[state]
  }, [])

  // Ana ürün ekleme fonksiyonu
  const handleAddToHeybe = useCallback(async () => {
    try {
      setButtonState('loading')

      // Ürün bilgilerini çıkar
      const productInfo = await extractProductInfo()

      if (!isValidProductInfo(productInfo)) {
        throw new Error('Ürün bilgileri alınamadı')
      }

      // Kullanıcı verilerini al
      const userData = await extensionStorage.getUserData()
      const userId = await getUserId(userData)

      // API çağrısı
      const apiResponse = await addProductToAPI({
        user_id: userId,
        ...productInfo
      })

      // Storage güncelle
      await extensionStorage.addProduct({
        id: apiResponse.data.product.id,
        ...productInfo,
        created_at: new Date().toISOString()
      })

      // Website ile senkronize et
      extensionStorage.syncWithWebsite().catch(err =>
        console.warn('Website sync failed:', err)
      )

      // Başarı durumu
      setButtonState('success')
      toast({
        title: t('common_success') || "Başarılı!",
        description: t('extension_productAddedToHeybe') || "Ürün Heybe'nize eklendi.",
      })

      // Callback çağır
      onProductAdd?.(productInfo)

      // 2 saniye sonra normal duruma dön
      setTimeout(() => {
        setButtonState('normal')
      }, 2000)

    } catch (error) {
      console.error('Product addition failed:', error)
      setButtonState('error')

      toast({
        variant: "destructive",
        title: t('extension_error') || "Hata!",
        description: error instanceof Error ? error.message : t('extension_productAddError') || 'Ürün eklenirken hata oluştu',
      })

      // 2 saniye sonra normal duruma dön
      setTimeout(() => {
        setButtonState('normal')
      }, 2000)
    }
  }, [onProductAdd])

  const config = getButtonConfig(buttonState)

  return (
    <div className={cn(
      "fixed right-0 top-1/2 -translate-y-1/2 z-[10000] transition-transform duration-300",
      isVisible ? "translate-x-0" : "translate-x-full hover:translate-x-0",
      className
    )}>
      <div className="flex shadow-lg rounded-l-lg overflow-hidden">
        {/* Sol kısım - Heybeye Ekle */}
        <Button
          variant={config.variant}
          disabled={config.disabled}
          onClick={handleAddToHeybe}
          className={cn(
            "rounded-none rounded-l-lg px-4 py-3 h-12 bg-white text-gray-700 hover:bg-gray-50",
            buttonState === 'success' && "bg-green-50 text-green-700",
            buttonState === 'error' && "bg-red-50 text-red-700"
          )}
        >
          <div className="flex items-center gap-2">
            <img
              src="/assets/heybe-logo.svg"
              alt="Heybe"
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">{config.text}</span>
          </div>
        </Button>

        {/* Sağ kısım - Ürünleri Gör */}
        <Button
          variant="default"
          onClick={() => window.open('https://my-heybe.vercel.app', '_blank')}
          className="rounded-none rounded-r-lg px-4 py-3 h-12 bg-blue-600 hover:bg-blue-700"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">{t('extension_viewList') || 'Listeyi Gör'}</span>
          </div>
        </Button>
      </div>

      {/* Progress bar - Success durumunda */}
      {buttonState === 'success' && (
        <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-pulse rounded-b-lg"
             style={{ width: '100%' }} />
      )}
    </div>
  )
}

// Utility fonksiyonlar
const isValidProductInfo = (info: ProductInfo): boolean => {
  return Boolean(
    info.name &&
    info.name !== 'Ürün' &&
    info.name.length > 2 &&
    info.url &&
    info.site
  )
}

// API ve Storage Utility Fonksiyonları
const getUserId = async (userData: UserData | null): Promise<string> => {
  if (userData?.userType === 'registered') {
    const registeredId = await extensionStorage.getRegisteredUserId()
    if (!registeredId) throw new Error('Registered user ID not found')
    return registeredId
  }

  // Guest user flow
  let guestId = await extensionStorage.getGuestUUID()
  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`
    await extensionStorage.setGuestUUID(guestId)
  }
  return guestId
}

const addProductToAPI = async (productData: {
  user_id: string
  name: string
  price: string
  image_urls: readonly string[]
  url: string
  site: string
}): Promise<any> => {
  const response = await fetch('https://api.heybe.com/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData)
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Ürün bilgilerini çıkarma fonksiyonu
const extractProductInfo = async (): Promise<ProductInfo> => {
  // Bu fonksiyon productDetection.ts'den gelecek
  // Şimdilik mock data
  return {
    name: document.title || 'Ürün',
    price: '0',
    image_urls: [],
    url: window.location.href,
    site: window.location.hostname
  }
}
}

```

// Content Script Initialization
const initContentScript = (): void => {
// Sayfa yüklendiğinde ve DOM değişikliklerinde çalışacak
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initializeHeybeButton)
} else {
initializeHeybeButton()
}

// Dinamik içerik değişikliklerini izle
const observer = new MutationObserver((mutations) => {
mutations.forEach((mutation) => {
if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
// Eğer button yoksa yeniden oluştur
if (!document.querySelector('#heybe-button-root')) {
setTimeout(initializeHeybeButton, 100)
}
}
})
})

observer.observe(document.body, {
childList: true,
subtree: true
})
}

// Ana initialization fonksiyonu
const initializeHeybeButton = async (): Promise<void> => {
try {
// Ürün sayfası kontrolü
const isProductPage = await detectProductPage()
if (!isProductPage) return

    // Mevcut button varsa kaldır
    const existingButton = document.querySelector('#heybe-button-root')
    if (existingButton) {
      existingButton.remove()
    }

    // React root oluştur ve HeybeButton component'ini render et
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'heybe-button-root'
    document.body.appendChild(buttonContainer)

    // React component'ini mount et
    const root = ReactDOM.createRoot(buttonContainer)
    root.render(React.createElement(HeybeButton))

} catch (error) {
console.error('Heybe button initialization failed:', error)
}
}

// Script başlatma
initContentScript()

````

### Storage Yönetimi (Cross-Browser Uyumlu)

```typescript
// storage.ts - WXT ile cross-browser uyumlu storage
import { storage } from 'wxt/storage';

interface UserData {
  userId: string;
  userType: 'guest' | 'registered';
  products: Product[];
}

export interface StorageData {
  currentUuid: string;
  auth: 'GUEST' | 'VERIFIED';
}

// Cross-browser storage helper (WXT otomatik olarak browser.* API'lerini kullanır)
export const extensionStorage = {
  // Kullanıcı verilerini kaydet (WXT storage API kullanarak)
  async setUserData(userData: UserData): Promise<void> {
    await storage.setItem('local:userData', userData);
  },

  // Kullanıcı verilerini al
  async getUserData(): Promise<UserData | null> {
    return await storage.getItem('local:userData') || null;
  },

  // Guest UUID yönetimi
  async setGuestUUID(uuid: string): Promise<void> {
    await storage.setItem('local:guestUUID', uuid);
  },

  async getGuestUUID(): Promise<string | null> {
    return await storage.getItem('local:guestUUID');
  },

  // Registered user ID yönetimi
  async setRegisteredUserId(userId: string): Promise<void> {
    await storage.setItem('local:registeredUserId', userId);
  },

  async getRegisteredUserId(): Promise<string | null> {
    return await storage.getItem('local:registeredUserId');
  },

  // WXT otomatik olarak doğru API'yi kullanır:
  // Chrome/Edge/Brave: chrome.storage
  // Firefox/Safari: browser.storage
  async get(key: keyof StorageData): Promise<any> {
    return await storage.getItem(`local:${key}`);
  },

  async set(key: keyof StorageData, value: any): Promise<void> {
    await storage.setItem(`local:${key}`, value);
    // Website'e değişiklik bildir
    this.notifyWebsite(key, value);
  },

  // Ürün ekle
  async addProduct(product: Product): Promise<void> {
    const userData = await this.getUserData();
    if (userData) {
      userData.products.push(product);
      await this.setUserData(userData);
    }
  },

  // Storage temizle (logout için)
  async clearUserData(): Promise<void> {
    await storage.removeItem('local:userData');
    await storage.removeItem('local:registeredUserId');
    // Guest UUID'yi koru, sadece yeni bir tane oluştur
    const newGuestUUID = crypto.randomUUID();
    await this.setGuestUUID(newGuestUUID);
  },

  async notifyWebsite(key: string, value: any): Promise<void> {
    // WXT otomatik olarak doğru messaging API'sini kullanır
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, {
        type: 'STORAGE_CHANGED',
        key,
        value
      });
    }
  },

  // Website ile senkronizasyon (cross-browser messaging)
  async syncWithWebsite(): Promise<void> {
    const userData = await this.getUserData();
    if (userData) {
      // WXT otomatik olarak browser.tabs API'sini kullanır
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        await browser.tabs.sendMessage(tabs[0].id, {
          type: 'SYNC_DATA',
          data: userData
        });
      }
    }
  },

  // Browser detection (debugging için)
  getBrowserInfo(): string {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      if (navigator.userAgent.includes('Edg')) return 'Edge';
      if (navigator.userAgent.includes('Chrome')) return 'Chrome';
      if (navigator.userAgent.includes('Brave')) return 'Brave';
    }
    if (typeof browser !== 'undefined' && browser.runtime) {
      if (navigator.userAgent.includes('Firefox')) return 'Firefox';
      if (navigator.userAgent.includes('Safari')) return 'Safari';
    }
    return 'Unknown';
  }
};

// Cross-browser messaging helper
export const crossBrowserMessaging = {
  // Content script'e mesaj gönder
  async sendToContentScript(tabId: number, message: any): Promise<void> {
    try {
      await browser.tabs.sendMessage(tabId, message);
    } catch (error) {
      console.error('Cross-browser messaging error:', error);
    }
  },

  // Background script'ten mesaj dinle
  onMessage(callback: (message: any, sender: any) => void): void {
    browser.runtime.onMessage.addListener(callback);
  }
};
````

### Cross-Browser API Handling (Detaylı)

WXT framework otomatik olarak farklı tarayıcılar için doğru API'leri kullanır: <mcreference link="https://wxt.dev/" index="2">2</mcreference>

**Desteklenen Tarayıcılar:**

- ✅ **Chrome** (chrome.\* API'leri)
- ✅ **Brave** (chrome.\* API'leri)
- ✅ **Edge** (chrome.\* API'leri)
- ✅ **Firefox** (browser.\* API'leri)
- ✅ **Safari** (browser.\* API'leri)

**API Dönüşüm Tablosu:**
| Özellik | Chrome/Edge/Brave | Firefox/Safari | WXT Kullanımı |
|---------|-------------------|----------------|---------------|
| Storage | `chrome.storage` | `browser.storage` | `storage.setItem()` |
| Messaging | `chrome.runtime` | `browser.runtime` | `browser.runtime` |
| Tabs | `chrome.tabs` | `browser.tabs` | `browser.tabs` |
| Notifications | `chrome.notifications` | `browser.notifications` | `browser.notifications` |

**Otomatik Polyfill Sistemi:**

```typescript
// WXT otomatik olarak şu dönüşümleri yapar:
// Chrome: chrome.storage.local.set()
// Firefox: browser.storage.local.set()
// Geliştirici sadece şunu yazar:
import { storage } from "wxt/storage";
await storage.setItem("local:key", value);

// Cross-browser messaging
// Tüm tarayıcılarda çalışır:
await browser.tabs.sendMessage(tabId, message);
```

**Heybe Extension Cross-Browser Implementasyonu:**

```typescript
// storage.ts - Tüm tarayıcılarda çalışır
export const extensionStorage = {
  // WXT storage API (otomatik cross-browser)
  async setGuestUUID(uuid: string): Promise<void> {
    await storage.setItem("local:guestUUID", uuid);
  },

  // Cross-browser messaging
  async syncWithWebsite(): Promise<void> {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, {
        type: "SYNC_DATA",
        data: await this.getUserData(),
      });
    }
  },

  // Browser detection (debugging)
  getBrowserInfo(): string {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      if (navigator.userAgent.includes("Edg")) return "Edge";
      if (navigator.userAgent.includes("Chrome")) return "Chrome";
      if (navigator.userAgent.includes("Brave")) return "Brave";
    }
    if (typeof browser !== "undefined" && browser.runtime) {
      if (navigator.userAgent.includes("Firefox")) return "Firefox";
      if (navigator.userAgent.includes("Safari")) return "Safari";
    }
    return "Unknown";
  },
};
```

- **Polyfill:** webextension-polyfill varsayılan olarak dahil <mcreference link="https://www.reddit.com/r/chrome_extensions/comments/1fs9om2/i_wrote_wxt_a_relatively_new_framework_for/" index="1">1</mcreference>

Bu sayede kod yazarken sadece `browser.*` API'lerini kullanabilir, WXT build sırasında gerekli dönüşümleri yapar.

---

## 👤 Kullanıcı Akışları

### 1. Misafir Kullanıcı Akışı

```mermaid
graph TD
    A[Eklenti Yüklenir] --> B[Otomatik Misafir UUID]
    B --> C[Storage: currentUuid, auth=GUEST]
    C --> D[Website Açılır]
    D --> E[Eklenti Storage Okunur]
    E --> F[Website Local Storage Güncellenir]
    F --> G[Sidebar: Misafir Gösterilir]
    G --> H[Ürün Sayfasında Buton Görünür]
    H --> I[Heybeye Ekle Tıklanır]
    I --> J{Auth Kontrolü}
    J -->|GUEST| K[Popup Açılır]
    K --> L[Misafir Olarak Devam Et]
    L --> M[Ürün Eklenir]
```

### 2. Kayıt/Giriş Akışı

```mermaid
graph TD
    A[Popup'ta Giriş/Kayıt] --> B[API İsteği]
    B --> C{Başarılı?}
    C -->|Evet| D[Response: UUID]
    C -->|Hayır| E[Hata Mesajı]
    D --> F[Extension Storage Güncelle]
    F --> G[auth=VERIFIED, currentUuid=newUUID]
    G --> H[Website'e Bildir]
    H --> I[Website Local Storage Güncelle]
    I --> J[Misafir Ürünleri Transfer Et]
    J --> K[Ürün Ekleme İsteği]
```

### 3. Ürün Transfer İşlemi (Düzeltilmiş)

```mermaid
graph TD
    A[Giriş/Kayıt İsteği] --> B[guest_user_id Gönderilir]
    B --> C[Backend: Ürün Kontrolü]
    C --> D{Misafir Ürünleri Var?}
    D -->|Evet| E[UPDATE products SET user_id=newUUID WHERE user_id=guestUUID]
    D -->|Hayır| F[Transfer Atlanır]
    E --> G[Transfer Tamamlandı]
    F --> G
    G --> H[Response: Başarılı + Transfer Sayısı]
```

```javascript
// Backend: /api/transfer-products
app.post("/api/transfer-products", async (req, res) => {
  const { guestUuid, registeredUserId } = req.body;

  try {
    // Sadece belirtilen guest UUID'ye ait ürünleri registered user'a transfer et
    const result = await pool.query(
      "UPDATE products SET user_id = $1 WHERE user_id = $2",
      [registeredUserId, guestUuid]
    );

    console.log(
      `${result.rowCount} ürün transfer edildi: ${guestUuid} -> ${registeredUserId}`
    );

    res.json({
      success: true,
      transferredCount: result.rowCount,
      message: `${result.rowCount} ürün başarıyla transfer edildi`,
    });
  } catch (error) {
    console.error("Ürün transfer hatası:", error);
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Storage Senkronizasyonu (Güncellenmiş)

```mermaid
sequenceDiagram
    participant W as Website
    participant E as Extension
    participant S as Storage

    Note over W,E: Kullanıcı Girişi
    W->>E: Login Event (userId)
    E->>S: Store Registered User ID
    E->>W: Confirm Storage Updated

    Note over W,E: Ürün Ekleme
    W->>E: Add Product Event
    E->>S: Store Product Locally
    E->>W: Sync Product Data

    Note over W,E: Website Çıkışı (Yeni!)
    W->>E: Logout Event
    E->>S: Clear Registered User ID
    E->>S: Generate New Guest UUID
    E->>W: Send New Guest UUID
    W->>W: Update Local Guest UUID

    Note over W,E: Sayfa Yenileme
    W->>E: Request Current User
    E->>S: Get Stored User ID
    S->>E: Return User Data
    E->>W: Send User Data
```

```mermaid
graph TD
    A[Extension Storage Değişir] --> B[Content Script'e Mesaj]
    B --> C[Website Event Listener]
    C --> D[Local Storage Güncelle]
    D --> E[UI State Güncelle]
    E --> F[Ürün Listesi Yenile]

    G[Website Çıkış] --> H[Extension Storage Temizle]
    H --> I[Yeni Misafir UUID]
    I --> J[Website'e Bildir]
    J --> K[UI Güncelle]
```

---

## 🧪 Test Senaryoları

### 16 Maddelik Test Süreci (Proje Promptuna Göre)

#### Test Ortamı Hazırlığı

- **Tarayıcılar:** Safari, Chrome, Brave, Edge, Firefox
- **Test Siteleri:** Çeşitli e-ticaret siteleri (Amazon, Trendyol, vb.)
- **Veritabanı:** Test PostgreSQL instance
- **Storage Keys:** `currentUuid`, `auth` (GUEST/VERIFIED)

#### Detaylı Test Senaryoları

**Test 1: İlk Website Ziyareti (Eklenti Yok)**

- Website'i aç
- Kayıt ol/Giriş yap
- `currentUuid` local storage'da oluşturulur
- Sidebar kullanıcı bilgilerini gösterir

**Test 2: Eklenti Kurulumu**

- Eklentiyi yükle (Safari/Chrome/Firefox/Edge/Brave)
- Otomatik misafir UUID oluşturulur
- Extension storage: `{currentUuid: "uuid", auth: "GUEST"}`

**Test 3: Website Yenileme (Extension Storage Sync)**

- Website'i yenile
- Extension storage okunur
- Local storage güncellenir
- Sidebar "Misafir Kullanıcı" gösterir

**Test 4: Misafir Ürün Ekleme**

- E-ticaret sitesinde "Heybeye Ekle" butonuna tıkla
- `auth=GUEST` kontrolü yapılır
- Popup açılır: "Giriş Yap" / "Misafir olarak devam et"
- "Misafir olarak devam et" seç
- Ürün extension storage'a eklenir

**Test 5: Popup'tan Giriş Yapma**

- Ürün sayfasında "Heybeye Ekle" tıkla
- Popup'ta "Giriş Yap" seç
- Giriş yap
- `auth=VERIFIED` güncellenir
- Ürün kayıtlı kullanıcı olarak eklenir

**Test 6: Çoklu Sekme Senkronizasyonu**

- 3-5 farklı ürün sayfası aç
- Birinde giriş yap
- Diğer sekmelerde UUID otomatik güncellenir
- Sayfa yenileme gerektirmez

**Test 7: Website'den Logout**

- Website'den çıkış yap
- Local storage temizlenir
- Extension storage temizlenir
- Yeni misafir UUID oluşturulur

**Test 8: Misafir Kullanıcı Devam Etme**

- Ürün sayfalarında popup aç
- "Misafir olarak devam et" seç
- Misafir UUID ile ürün ekleme
- Extension storage'da saklanır

**Test 9: Misafir → Kayıt Transfer**

- Misafir olarak 2-3 ürün ekle
- Website'de kayıt ol
- Misafir ürünleri kayıtlı kullanıcıya transfer edilir
- Hiç ürün kaybolmaz

**Test 10: Misafir → Giriş Transfer**

- Misafir olarak ürün ekle
- Mevcut hesapla giriş yap
- Misafir ürünleri mevcut hesaba transfer edilir
- Duplicate ürün kontrolü yapılır

**Test 11: Transfer Sonrası Doğrulama**

- Transfer işlemi sonrası
- Website'de tüm ürünler görünür
- Extension storage temizlenip yeni UUID ile güncellenir
- Senkronizasyon doğru çalışır

**Test 12: Eklenti Kaldırma (Giriş Yapmış)**

- Giriş yapmış durumda eklentiyi kaldır
- Website extension storage bulamaz
- Local storage ile devam eder
- Ürün ekleme devre dışı kalır

**Test 13: Eklenti Kaldırma (Misafir)**

- Misafir durumda eklentiyi kaldır
- Website extension storage bulamaz
- Misafir ürünlere erişim kaybolur
- Yeni giriş gerekir

**Test 14: Logout (Extension Yüklü)**

- Extension yüklü durumda logout
- Her iki storage da temizlenir
- Yeni misafir UUID oluşturulur
- Senkronizasyon devam eder

**Test 15: Logout (Extension Yok)**

- Extension olmadan logout
- Sadece local storage temizlenir
- Yeni giriş için hazır duruma geçer

**Test 16: Cross-Browser Test**

- Aynı hesapla farklı tarayıcılarda giriş
- Ürünlerin senkronize olduğunu doğrula
- Extension'ların bağımsız çalıştığını kontrol et
- Storage izolasyonunu test et

---

## 🚀 Geliştirme Adımları

### Faz 1: Temel Altyapı (1-2 Hafta)

1. **Monorepo Kurulumu**

   - pnpm workspace konfigürasyonu
   - Temel klasör yapısı
   - Package.json dosyaları

2. **Veritabanı Kurulumu**

   - PostgreSQL şema oluşturma
   - Test verisi ekleme
   - Connection string konfigürasyonu

3. **Backend API Temel Yapısı**
   - Express.js kurulumu
   - Database connection
   - CORS konfigürasyonu
   - Temel middleware'ler

### Faz 2: Backend Geliştirme (2-3 Hafta)

1. **API Endpoint'leri**

   - Auth endpoints (login/register)
   - Product endpoints (CRUD)
   - Database utility endpoints

2. **Transfer Logic**

   - Misafir ürün transfer algoritması
   - Error handling
   - Logging sistemi

3. **Testing**
   - API endpoint testleri
   - Database işlem testleri

### Faz 3: Frontend Geliştirme (3-4 Hafta)

1. **Temel UI Yapısı**

   - React + Vite kurulumu
   - shadcn/ui konfigürasyonu
   - Tailwind CSS kurulumu

2. **Ana Bileşenler**

   - Sidebar komponenti
   - Product list komponenti
   - Auth modal komponenti

3. **Extension İletişimi**
   - Storage senkronizasyon logic
   - Event listener sistemi
   - Error handling

### Faz 4: Extension Geliştirme (3-4 Hafta)

1. **WXT Kurulumu**

   - Multi-browser konfigürasyonu
   - React + shadcn entegrasyonu
   - Build sistemi

2. **Core Functionality**

   - Product detection algoritması
   - Floating button komponenti
   - Storage management

3. **API İletişimi**
   - Backend API entegrasyonu
   - Auth popup komponenti
   - Error handling

### Faz 5: Entegrasyon ve Test (2-3 Hafta)

1. **Sistem Entegrasyonu**

   - Extension-Website iletişimi
   - Storage senkronizasyonu
   - Transfer işlemleri

2. **Kapsamlı Test**

   - 16 maddelik test senaryoları
   - Multi-browser testing
   - Edge case testleri

3. **Bug Fixing ve Optimizasyon**
   - Performance optimizasyonu
   - UI/UX iyileştirmeleri
   - Code review ve refactoring

### Faz 6: Deployment ve Dokümantasyon (1 Hafta)

1. **Production Hazırlığı**

   - Environment konfigürasyonları
   - Build optimizasyonları
   - Security review

2. **Dokümantasyon**
   - API dokümantasyonu
   - Kullanıcı kılavuzu
   - Developer guide

---

## 🔧 Kritik Teknik Notlar

#### Cross-Browser API Compatibility

WXT framework sayesinde farklı tarayıcılar için API uyumluluğu otomatik olarak sağlanır: <mcreference link="https://blog.logrocket.com/developing-web-extensions-wxt-library/" index="5">5</mcreference>

- **Chromium-based (Chrome, Edge, Brave):** `chrome.*` API'leri
- **Firefox/Safari:** `browser.*` API'leri
- **Otomatik Polyfill:** webextension-polyfill varsayılan olarak dahil <mcreference link="https://devshogun.medium.com/creating-a-browser-extension-using-solidjs-wxt-ii-2ff10fcafc98" index="4">4</mcreference>
- **Kod Yazımı:** Sadece `browser.*` API'leri kullanılır, WXT build sırasında dönüştürür

#### Storage Senkronizasyonu

- **Extension Storage** merkezi depolama alanı olarak kullanılacak
- **Website Local Storage** extension storage ile senkronize edilecek
- **Real-time Updates** content script messaging ile sağlanacak
- **Fallback Mechanism** extension yoksa local storage kullanılacak

### Kullanıcı Transfer İşlemleri

- **Atomik İşlemler** veritabanı transaction'ları ile güvence altına alınacak
- **Duplicate Prevention** aynı ürünün birden fazla kez eklenmesi engellenecek
- **Error Recovery** transfer başarısız olursa rollback yapılacak
- **Logging** tüm transfer işlemleri loglanacak

### Extension-Website İletişimi

- **Content Script** messaging bridge olarak kullanılacak
- **Event-Driven Architecture** storage değişiklikleri event-based olacak
- **Cross-Origin Handling** güvenlik kısıtlamaları dikkate alınacak
- **Timeout Handling** iletişim timeout'ları için fallback mekanizmaları

### Güvenlik Önlemleri

- **Password Hashing** bcryptjs ile güvenli hash
- **SQL Injection Prevention** parameterized queries
- **XSS Protection** input sanitization
- **CORS Configuration** sadece gerekli origin'lere izin

### Performance Optimizasyonları

- **Database Indexing** sık kullanılan kolonlarda index
- **Lazy Loading** ürün listesi pagination ile
- **Caching** API response'ları için client-side cache
- **Bundle Optimization** code splitting ve tree shaking

---

## 📋 Sonuç ve Kontrol Listesi

### Proje Tamamlanma Kriterleri

- [ ] Tüm 3 uygulama (API, Website, Extension) çalışır durumda
- [ ] 16 maddelik test senaryosu başarıyla geçildi
- [ ] 5 tarayıcıda (Chrome, Firefox, Safari, Edge, Brave) test edildi
- [ ] Storage senkronizasyonu sorunsuz çalışıyor
- [ ] Kullanıcı transfer işlemleri hatasız gerçekleşiyor
- [ ] Production ortamında deploy edilebilir durumda

### Kalite Kontrol

- [ ] Code review tamamlandı
- [ ] Unit testler yazıldı ve geçiyor
- [ ] Integration testler başarılı
- [ ] Performance testleri yapıldı
- [ ] Security audit tamamlandı
- [ ] Dokümantasyon güncel ve eksiksiz

### Deployment Hazırlığı

- [ ] Environment variables konfigüre edildi
- [ ] Database migration scriptleri hazır
- [ ] Build process optimize edildi
- [ ] Monitoring ve logging sistemi kuruldu
- [ ] Backup stratejisi belirlendi

---

## "Heybeye Ekle" Butonu Akış Şeması

```mermaid
flowchart TD
    A[Kullanıcı "Heybeye Ekle" butonuna tıklar] --> B{Ürün sayfası tespit edildi mi?}

    B -->|Hayır| C[Hata toast: "Bu sayfa bir ürün sayfası değil"]
    C --> D[Buton normal duruma döner]

    B -->|Evet| E[Buton loading durumuna geçer]
    E --> F[Ürün bilgileri çıkarılır]
    F --> G{Ürün bilgileri geçerli mi?}

    G -->|Hayır| H[Hata toast: "Ürün bilgileri alınamadı"]
    H --> D

    G -->|Evet| I{Kullanıcı giriş yapmış mı?}

    I -->|Hayır| J[Guest token kontrol edilir]
    J --> K{Guest token var mı?}

    K -->|Hayır| L[Yeni guest token oluşturulur]
    L --> M[Extension storage'a kaydedilir]
    M --> N[API'ye ürün ekleme isteği]

    K -->|Evet| N

    I -->|Evet| O[Kullanıcı token'ı alınır]
    O --> N

    N --> P{API isteği başarılı mı?}

    P -->|Hayır| Q{Hata türü nedir?}
    Q -->|401 Unauthorized| R[Token yenilenir]
    R --> S{Token yenileme başarılı mı?}
    S -->|Evet| N
    S -->|Hayır| T[Hata toast: "Oturum süresi doldu"]
    T --> D

    Q -->|Diğer hatalar| U[Hata toast: API hata mesajı]
    U --> D

    P -->|Evet| V[Başarı toast: "Ürün listenize eklendi"]
    V --> W[Buton success durumuna geçer]
    W --> X[Extension storage güncellenir]
    X --> Y[Website senkronizasyonu (non-blocking)]
    Y --> Z[2 saniye sonra buton normal duruma döner]
    Z --> AA[İşlem tamamlandı]

    style A fill:#e1f5fe
    style AA fill:#c8e6c9
    style C fill:#ffcdd2
    style H fill:#ffcdd2
    style T fill:#ffcdd2
    style U fill:#ffcdd2
    style V fill:#c8e6c9
```

### Buton Durumları ve Davranışları

#### Normal Durum

- **Görünüm**: Heybe logosu + "Heybeye Ekle" metni
- **Davranış**: Tıklanabilir, hover efektleri aktif
- **Accessibility**: `aria-label="Ürün eklemek için hazır"`
- **CSS Class**: `heybe-add-button normal`

#### Loading Durum

- **Görünüm**: Spinner animasyonu + "Ekleniyor..." metni
- **Davranış**: Devre dışı, tıklanamaz
- **Accessibility**: `aria-busy="true"`, `aria-label="Ürün ekleniyor"`
- **CSS Class**: `heybe-add-button loading`
- **Süre**: API isteği tamamlanana kadar

#### Success Durum

- **Görünüm**: Yeşil tick işareti + "Eklendi!" metni
- **Davranış**: Geçici durum, tıklanamaz
- **Accessibility**: `aria-label="Ürün başarıyla eklendi"`
- **CSS Class**: `heybe-add-button success`
- **Süre**: 2 saniye, sonra normal duruma döner

#### Error Durum

- **Görünüm**: Kırmızı X işareti + "Hata!" metni
- **Davranış**: Geçici durum, tıklanamaz
- **Accessibility**: `aria-label="Ürün eklenirken hata oluştu"`
- **CSS Class**: `heybe-add-button error`
- **Süre**: 3 saniye, sonra normal duruma döner

### Toast Mesaj Türleri

#### Başarı Toast'ı

- **Mesaj**: "Ürün listenize eklendi!"
- **Renk**: Yeşil (#10b981)
- **İkon**: ✓
- **Süre**: 4 saniye
- **Pozisyon**: Sağ üst köşe

#### Hata Toast'ları

- **Ürün sayfası değil**: "Bu sayfa bir ürün sayfası değil"
- **Ürün bilgisi yok**: "Ürün bilgileri alınamadı"
- **Oturum süresi**: "Oturum süresi doldu, lütfen tekrar giriş yapın"
- **API hatası**: Backend'den gelen hata mesajı
- **Renk**: Kırmızı (#ef4444)
- **İkon**: ✗
- **Süre**: 4 saniye

#### Bilgi Toast'ı

- **Mesaj**: "İşlem devam ediyor..."
- **Renk**: Mavi (#3b82f6)
- **İkon**: ℹ
- **Süre**: 3 saniye

## 📋 TypeScript Type Definitions

### Core Types

```typescript
// User Types
type User = {
  uuid: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type GuestUser = {
  guest_user_id: string;
  role: "GUEST";
};

// Product Types
type Product = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  currency: string;
  image_url?: string;
  product_url: string;
  store_name: string;
  created_at: string;
  updated_at: string;
};

type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;

// API Response Types
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  transferredCount?: number; // Login/Register için
};

type LoginRequest = {
  email: string;
  password: string;
  guest_user_id?: string;
  role?: "GUEST";
};

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  guest_user_id?: string;
  role?: "GUEST";
};

type AuthResponse = ApiResponse<{
  user: User;
  token: string;
  transferredCount?: number;
}>;
```

### Component Props Types

```typescript
// Auth Modal Props
type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  guestUserId?: string;
};

// Product Card Props
type ProductCardProps = {
  product: Product;
  onDelete?: (id: string) => void;
  onEdit?: (product: Product) => void;
  isLoading?: boolean;
};

// Sidebar Props
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  productCount: number;
};
```

### Hook Types

```typescript
// Auth Hook
type UseAuthReturn = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
};

// Products Hook
type UseProductsReturn = {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: ProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, product: Partial<ProductInput>) => Promise<void>;
  refetch: () => void;
};
```

## 🎨 Shadcn-First Component Hierarchy

### Design System Foundation

```typescript
// Base Shadcn Components Kullanımı
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
```

### Component Architecture

#### 1. Layout Components (Shadcn + Custom)

```typescript
// AppLayout.tsx - Ana layout wrapper
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};

// Header.tsx - Shadcn Button + Avatar kullanımı
const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost">Ürünlerim</Button>
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
```

#### 2. Auth Components (Shadcn Dialog + Tabs)

```typescript
// AuthModal.tsx - Shadcn Dialog + Tabs
const AuthModal = ({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hesabınıza Giriş Yapın</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// LoginForm.tsx - Shadcn Input + Button
const LoginForm = () => {
  return (
    <form className="space-y-4">
      <Input type="email" placeholder="E-posta" />
      <Input type="password" placeholder="Şifre" />
      <Button type="submit" className="w-full">
        Giriş Yap
      </Button>
    </form>
  );
};
```

#### 3. Product Components (Shadcn Card + Badge)

```typescript
// ProductCard.tsx - Shadcn Card + Badge + Button
const ProductCard = ({ product, onDelete, onEdit }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">
            {product.title}
          </CardTitle>
          <Badge variant="secondary">
            {product.currency} {product.price}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {product.store_name}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(product)}
            >
              Düzenle
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(product.id)}
            >
              Sil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ProductGrid.tsx - Grid layout with Shadcn Cards
const ProductGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Styling Guidelines

#### 1. Tailwind + CSS Variables

```css
/* globals.css - Shadcn theme variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

#### 2. Component Variants

```typescript
// Button variants (Shadcn built-in)
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

// Custom component variants
const productCardVariants = {
  default: "border bg-card text-card-foreground shadow-sm",
  featured: "border-2 border-primary bg-card text-card-foreground shadow-md",
  compact: "border bg-card text-card-foreground shadow-sm p-3",
};
```

### Accessibility Standards

#### 1. ARIA Labels ve Roles

```typescript
// Proper ARIA implementation
const AccessibleButton = () => {
  return (
    <Button
      aria-label="Ürünü favorilere ekle"
      aria-describedby="favorite-help"
      onClick={handleFavorite}
    >
      <Heart className="h-4 w-4" />
      <span className="sr-only">Favorilere Ekle</span>
    </Button>
  );
};

// Form accessibility
const AccessibleForm = () => {
  return (
    <form role="form" aria-labelledby="login-title">
      <h2 id="login-title">Giriş Yap</h2>
      <Input
        aria-label="E-posta adresi"
        aria-required="true"
        aria-invalid={hasError}
        aria-describedby={hasError ? "email-error" : undefined}
      />
      {hasError && (
        <div id="email-error" role="alert" className="text-destructive text-sm">
          Geçerli bir e-posta adresi girin
        </div>
      )}
    </form>
  );
};
```

#### 2. Keyboard Navigation

```typescript
// Keyboard event handling
const KeyboardAccessibleCard = ({ product }: { product: Product }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleProductClick();
    }
  };

  return (
    <Card
      tabIndex={0}
      role="button"
      aria-label={`${product.title} ürününü görüntüle`}
      onKeyDown={handleKeyDown}
      onClick={handleProductClick}
      className="cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {/* Card content */}
    </Card>
  );
};
```

---

**Bu roadmap, Heybe projesinin başarıyla tamamlanması için gerekli tüm adımları ve detayları içermektedir. Her faz sonunda ilerleme değerlendirmesi yapılmalı ve gerekirse roadmap güncellenmelidir.**
