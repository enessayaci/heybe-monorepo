# Tüm Listem Extension

> Farklı e-ticaret sitelerindeki ürünleri tek bir listede toplayan browser extension.

## Available Scripts

In the project directory, you can run the following scripts:

### npm dev

**Development Mode**: This command runs your extension in development mode. It will launch a new browser instance with your extension loaded. The page will automatically reload whenever you make changes to your code, allowing for a smooth development experience.

```bash
npm dev
```

### npm start

**Production Preview**: This command runs your extension in production mode. It will launch a new browser instance with your extension loaded, simulating the environment and behavior of your extension as it will appear once published.

```bash
npm start
```

### npm build

**Build for Production**: This command builds your extension for production. It optimizes and bundles your extension, preparing it for deployment to the target browser's store.

```bash
npm build
```

## Tertemiz İlk Kurulum

### 1. Chrome/Edge İçin:

```
1. chrome://extensions/ sayfasını açın
2. "Developer mode" açın (sağ üst köşe)
3. "Load unpacked" butonuna tıklayın
4. Bu proje klasörünü seçin
5. ✅ Extension aktif olacak
```

### 2. Firefox İçin:

```
1. about:debugging sayfasını açın
2. "This Firefox" sekmesini seçin
3. "Load Temporary Add-on" butonuna tıklayın
4. manifest.json dosyasını seçin
5. ✅ Extension aktif olacak
```

### 3. Test Edin:

```
1. trendyol.com, amazon.com.tr gibi e-ticaret sitesini açın
2. F12 → Console açın
3. Aşağıdaki log'ları göreceksiniz:
   🔧 [Tüm Listem] Extension Storage yüklendi - Tarayıcı: Chrome/Edge
   👤 [Tüm Listem] İlk kurulum - Yeni kullanıcı ID oluşturuldu: abc-123-def-456
4. Sağ tarafta "Tüm Listeme Ekle" butonu görünecek
```

## Özellikler

- ✅ **Cross-Domain UUID**: Tüm sitelerde aynı kullanıcı kimliği
- ✅ **Extension Storage**: Chrome/Firefox native storage API
- ✅ **Akıllı Ürün Tespiti**: Meta tag'lerden ürün bilgisi çıkarma
- ✅ **Cross-Browser**: Chrome, Firefox, Edge uyumlu
- ✅ **Clean API**: localStorage bağımlılığı yok

## Cross-Browser Build Talimatları

### 🔧 Extension Build Etme:

Repoyu çektikten sonra extension'ı build etmek için:

```bash
cd heybe-extension
npm install
```

**Tüm tarayıcılar için build:**
```bash
npm run build:all
```

**Tek tarayıcı için build:**
```bash
npm run build:chrome    # Chrome için (Manifest V3)
npm run build:firefox   # Firefox için (Manifest V2)
npm run build:safari    # Safari için (Manifest V2)
```

### 📁 Build Çıktıları:

```
heybe-extension/dist/
├── chrome/     # Chrome için hazır extension
├── firefox/    # Firefox için hazır extension  
└── safari/     # Safari için hazır extension
```

### 🚀 Extension Kurulum:

#### Chrome:
1. `chrome://extensions/` aç
2. "Developer mode" açın
3. "Load unpacked" → `dist/chrome` klasörünü seçin

#### Firefox:
1. `about:debugging` aç  
2. "This Firefox" → "Load Temporary Add-on"
3. `dist/firefox/manifest.json` dosyasını seçin

#### Safari:
1. Safari > Geliştir > Web Extension'ları
2. `dist/safari` klasörünü yükleyin

## API Endpoint

Backend: https://my-heybe.vercel.app/api/add-product

## Learn More

To learn more about creating cross-browser extensions with Extension.js, visit the [official documentation](https://extension.js.org).
