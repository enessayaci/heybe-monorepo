// Backend ile tam uyumlu Product interface
export interface Product {
  id: number;
  user_id: number;
  name: string; // Backend'deki name alanı
  price: string;
  image_urls: string[]; // Backend'deki image_urls array
  url: string;
  site: string;
  created_at: string; // ISO string format
  updated_at: string; // ISO string format
}

// Ürün ekleme için request interface (backend CreateProductData ile uyumlu)
export interface AddProductRequest {
  name: string; // Backend'in beklediği name alanı
  price: string;
  image_urls: string[]; // Backend'in beklediği image_urls array
  url: string;
  site: string;
  // user_id backend'de token'dan alınıyor, request'e dahil edilmiyor
}

// Frontend'de kullanılacak interface (Product ile aynı)
export interface FrontendProduct extends Product {}

export interface User {
  id: number;
  email: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GuestTokenResponse {
  token: string;
  user_id: number;
}