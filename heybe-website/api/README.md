# My List Sepet API

Bu API, My List Sepet Extension için PostgreSQL veritabanı ile entegre serverless function'ları içerir.

## Kurulum

### 1. PostgreSQL Konfigürasyonu

`add-product.js`, `get-products.js` ve `delete-product.js` dosyalarındaki PostgreSQL bağlantı bilgilerini güncelleyin:

```javascript
const pool = new Pool({
  user: "postgres", // PostgreSQL kullanıcı adınız
  host: "localhost",
  database: "MyListDB", // Veritabanı adınız
  password: "123456", // PostgreSQL şifreniz
  port: 5432,
});
```

### 2. Bağımlılıkları Yükleyin

```bash
cd api
npm install
```

### 3. Vercel'de Deploy Edin

1. Bu klasörü GitHub'a push edin
2. [Vercel](https://vercel.com)'e gidin ve GitHub hesabınızla giriş yapın
3. "New Project" seçin ve GitHub repo'nuzu bağlayın
4. Framework Preset: "Other" seçin
5. Deploy edin

### 4. Extension'da API URL'ini Güncelleyin

Deploy sonrası aldığınız Vercel URL'ini extension dosyalarında güncelleyin:

- `contentScript.js` dosyasında: `API_ENDPOINT` değişkeni
- `index.html` dosyasında: `API_BASE` değişkeni

## API Endpoint'leri

### POST /api/add-product

Yeni ürün ekler.

**Request Body:**

```json
{
  "name": "Ürün Adı",
  "price": "₺99.99",
  "image_url": "https://example.com/image.jpg",
  "product_url": "https://example.com/product",
  "site": "example.com"
}
```

### GET /api/get-products

Tüm ürünleri getirir.

### DELETE /api/delete-product

Ürün siler.

**Request Body:**

```json
{
  "id": 1
}
```

## Test

API'yi test etmek için:

```bash
# Ürün ekle
curl -X POST https://your-app.vercel.app/api/add-product \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Ürün","price":"₺99","product_url":"https://example.com","site":"example.com"}'

# Ürünleri getir
curl https://your-app.vercel.app/api/get-products

# Ürün sil
curl -X DELETE https://your-app.vercel.app/api/delete-product \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

## Vercel Avantajları

✅ **Hızlı Deploy**: GitHub bağlantısı ile otomatik deploy  
✅ **Kolay Konfigürasyon**: Minimal setup gerektirir  
✅ **Ücretsiz Tier**: Aylık 100GB bandwidth  
✅ **Edge Network**: Hızlı global erişim  
✅ **Otomatik HTTPS**: SSL sertifikası otomatik  
✅ **Environment Variables**: Güvenli konfigürasyon
