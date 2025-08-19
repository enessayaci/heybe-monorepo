# Heybe Project Roadmap

## Proje Genel Bakış

Heybe, kullanıcıların farklı alışveriş sitelerinde gezdikleri ürünleri tek bir listede toplayabilecekleri bir monorepo projesidir. Proje 3 ana bileşenden oluşur:

- **heybe-api**: Node.js backend API
- **heybe-website**: React frontend web uygulaması
- **heybe-extension**: WXT framework ile geliştirilmiş browser eklentisi

## Teknoloji Stack

### Backend (heybe-api)
- Node.js
- PostgreSQL
- Express.js (veya benzeri framework)
- UUID generation
- CORS support

### Frontend (heybe-website)
- React 18+
- TypeScript
- Shadcn UI
- Tailwind CSS
- Vite
- pnpm package manager

### Extension (heybe-extension)
- WXT Framework
- React
- Shadcn UI
- Tailwind CSS
- Cross-browser support (Chrome, Firefox, Safari, Edge, Brave)

## Geliştirme Aşamaları

### Faz 1: Proje Yapısı ve Backend API

#### 1.1 Monorepo Kurulumu
- [ ] Root seviyede pnpm workspace konfigürasyonu
- [ ] 3 ana klasör oluşturma: `heybe-api`, `heybe-website`, `heybe-extension`
- [ ] Ortak dependencies ve scripts tanımlama

#### 1.2 Database Schema Tasarımı
- [ ] PostgreSQL tablo şemalarının oluşturulması
- [ ] SQL script hazırlama
- [ ] Kullanıcı tablosu (users)
- [ ] Ürün tablosu (products)
- [ ] İlişkisel tablolar

#### 1.3 Backend API Geliştirme
- [ ] Eski serverless functionları Node.js uygulamasına dönüştürme
- [ ] Endpoint'lerin yeniden yapılandırılması:
  - `POST /api/register` - Kullanıcı kaydı
  - `POST /api/login` - Kullanıcı girişi
  - `GET /api/products/:uuid` - Kullanıcı ürünlerini getirme
  - `POST /api/products` - Ürün ekleme
  - `DELETE /api/products/:id` - Ürün silme
  - `POST /api/transfer-products` - Misafir ürünlerini transfer etme
- [ ] UUID generation ve yönetimi
- [ ] CORS konfigürasyonu
- [ ] Error handling ve validation

### Faz 2: Frontend Web Uygulaması

#### 2.1 Proje Kurulumu
- [ ] React + TypeScript + Vite kurulumu
- [ ] Shadcn UI konfigürasyonu
- [ ] Tailwind CSS kurulumu
- [ ] Folder structure oluşturma

#### 2.2 UI Bileşenleri
- [ ] Collapsible Sidebar komponenti
- [ ] Logo ve branding
- [ ] Navigation menüleri (Ürünlerim, Kurulum)
- [ ] Tooltip sistemi
- [ ] Modal/Popup bileşenleri

#### 2.3 Authentication Sistemi
- [ ] Login/Register form komponenti
- [ ] Tab-based authentication UI
- [ ] Dil seçimi dropdown (TR/EN)
- [ ] Ülke bayrakları entegrasyonu
- [ ] Logout functionality

#### 2.4 Ürün Yönetimi
- [ ] Ürün listesi komponenti
- [ ] Ürün satırı tasarımı (resim, başlık, domain, butonlar)
- [ ] Arama functionality (client-side)
- [ ] İstatistik bar (toplam ürün, site sayısı)
- [ ] Empty state komponenti
- [ ] Ürün silme functionality

#### 2.5 Extension Integration
- [ ] Extension storage ile iletişim
- [ ] Real-time sync mekanizması
- [ ] Extension kurulum kontrolü
- [ ] Kurulum popup'ı

### Faz 3: Browser Extension

#### 3.1 WXT Framework Kurulumu
- [ ] WXT project initialization
- [ ] React template konfigürasyonu
- [ ] Cross-browser manifest konfigürasyonu
- [ ] Shadcn UI entegrasyonu

#### 3.2 Content Script Geliştirme
- [ ] Ürün sayfası algılama algoritması
- [ ] Meta tag analizi
- [ ] DOM element detection
- [ ] Floating button injection

#### 3.3 UI Bileşenleri
- [ ] Floating action button tasarımı
- [ ] Hover animasyonları
- [ ] Loading states
- [ ] Success feedback (progress bar)
- [ ] Toast notifications

#### 3.4 Authentication Flow
- [ ] Storage management (currentUuid, auth)
- [ ] Guest user generation
- [ ] Login/Register popup
- [ ] Auth state synchronization

#### 3.5 Product Management
- [ ] Meta data extraction
- [ ] API integration
- [ ] Error handling
- [ ] Product transfer logic

### Faz 4: Storage Synchronization

#### 4.1 Extension Storage
- [ ] Central storage implementation
- [ ] Key management (currentUuid, auth)
- [ ] Cross-tab communication
- [ ] Storage event listeners

#### 4.2 Website Integration
- [ ] Extension detection
- [ ] Storage sync on page load
- [ ] Real-time updates
- [ ] Fallback to localStorage

#### 4.3 State Management
- [ ] User state synchronization
- [ ] Product list updates
- [ ] Auth status management
- [ ] Logout handling

### Faz 5: Advanced Features

#### 5.1 Internationalization
- [ ] i18n setup (TR/EN)
- [ ] Language switching
- [ ] Flag icons
- [ ] Tooltip translations

#### 5.2 Product Transfer System
- [ ] Guest to registered user transfer
- [ ] Backend transfer logic
- [ ] UI feedback
- [ ] Error handling

#### 5.3 Installation Management
- [ ] Extension detection
- [ ] Installation prompts
- [ ] Browser-specific instructions
- [ ] Status indicators

### Faz 6: Testing ve Optimization

#### 6.1 Cross-Browser Testing
- [ ] Chrome testing
- [ ] Firefox testing
- [ ] Safari testing
- [ ] Edge testing
- [ ] Brave testing

#### 6.2 Test Scenarios
16 maddelik test senaryolarının implementasyonu:
- [ ] Website açılışı (eklenti yok)
- [ ] Extension kurulumu
- [ ] Storage synchronization
- [ ] Guest user flow
- [ ] Authentication flow
- [ ] Product addition
- [ ] Multi-tab scenarios
- [ ] Logout scenarios
- [ ] Product transfer
- [ ] Extension removal scenarios

#### 6.3 Performance Optimization
- [ ] Bundle size optimization
- [ ] API response optimization
- [ ] UI performance tuning
- [ ] Memory leak prevention

### Faz 7: Deployment ve Documentation

#### 7.1 Deployment Setup
- [ ] Backend deployment configuration
- [ ] Frontend build optimization
- [ ] Extension packaging
- [ ] Environment variables

#### 7.2 Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer documentation
- [ ] Installation instructions

## Geliştirme Prensipleri

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Semantic HTML
- Accessibility compliance
- Progressive enhancement

### Architecture
- Modular component design
- Clean separation of concerns
- Error boundary implementation
- Responsive design
- Cross-browser compatibility

### Security
- XSS prevention
- CORS configuration
- Input validation
- Secure storage practices
- Privacy compliance

## Milestone Timeline

### Sprint 1 (Hafta 1-2): Foundation
- Monorepo setup
- Database schema
- Basic backend API

### Sprint 2 (Hafta 3-4): Frontend Core
- React app setup
- Basic UI components
- Authentication system

### Sprint 3 (Hafta 5-6): Extension Core
- WXT setup
- Content script
- Basic functionality

### Sprint 4 (Hafta 7-8): Integration
- Storage synchronization
- Cross-component communication
- Basic testing

### Sprint 5 (Hafta 9-10): Advanced Features
- Product transfer
- Multi-language support
- Advanced UI features

### Sprint 6 (Hafta 11-12): Testing & Polish
- Cross-browser testing
- Performance optimization
- Bug fixes

## Risk Faktörleri

### Teknik Riskler
- Cross-browser extension compatibility
- Storage synchronization complexity
- Real-time communication challenges

### Çözüm Stratejileri
- Extensive browser testing
- Fallback mechanisms
- Progressive enhancement approach
- Comprehensive error handling

## Success Metrics

- [ ] Tüm 16 test senaryosunun başarılı geçilmesi
- [ ] 5 farklı tarayıcıda sorunsuz çalışma
- [ ] Storage synchronization %100 güvenilirlik
- [ ] Responsive design tüm cihazlarda
- [ ] Accessibility compliance
- [ ] Performance benchmarks

## Sonraki Adımlar

1. Database connection string alınması
2. SQL schema scriptlerinin çalıştırılması
3. Monorepo kurulumuna başlanması
4. Backend API geliştirmeye başlanması

Bu roadmap, projenin tüm gereksinimlerini kapsayacak şekilde tasarlanmış olup, her aşamada test edilebilir ve iteratif geliştirme yaklaşımını desteklemektedir.