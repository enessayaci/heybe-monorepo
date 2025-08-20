import type {
  Product,
  AddProductRequest,
  FrontendProduct,
  User,
  ApiResponse,
  AuthResponse,
  GuestTokenResponse,
} from "./api.types";

import { storage } from "wxt/storage";
import { storageService } from "./storage.service";

class ApiService {
  private readonly baseUrl = "https://heybe-monorepo.onrender.com/api";
  private onUnauthorized?: (errorMessage?: string) => void;

  // 401 hatası durumunda çağrılacak callback'i set etme
  setUnauthorizedCallback(callback: (errorMessage?: string) => void) {
    this.onUnauthorized = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // 401 hatası durumunda token'ı sil ve callback çağır
        if (response.status === 401) {
          const errorMessage = data.message || "Kimlik doğrulama hatası";
          await this.handleUnauthorized(errorMessage);
        }
        
        return {
          success: false,
          message: data.message || "Request failed",
          status: response.status,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  private async handleUnauthorized(errorMessage?: string) {
    try {
      // Storage'ı tamamen temizle - ilk yükleme gibi
      await storageService.removeToken();
      await storageService.removeIsGuest();
      
      // Auth modal'ı aç ve hata mesajını göster
      if (this.onUnauthorized) {
        this.onUnauthorized(errorMessage);
      }
    } catch (error) {
      console.error('Error handling unauthorized:', error);
    }
  }

  private async getToken(): Promise<string | null> {
    return await storage.getItem("local:token");
  }

  // Guest token oluşturma
  async createGuestToken(): Promise<ApiResponse<GuestTokenResponse>> {
    return this.request<GuestTokenResponse>("/auth/guest", {
      method: "POST",
    });
  }

  // Ürün ekleme
  async addProduct(
    productData: AddProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>("/products/add", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  // Ürünleri getirme
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products");
  }

  // Kullanıcı girişi
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Kullanıcı kaydı
  async register(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Misafir transferi ile giriş
  async loginWithGuestTransfer(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login-with-transfer", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Misafir transferi ile kayıt
  async registerWithGuestTransfer(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/register-with-transfer", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Backend Product'ı Frontend Product'a dönüştürme
  static mapBackendProductToFrontend(product: Product): FrontendProduct {
    return {
      ...product,
      created_at: new Date(product.created_at).toISOString(),
      updated_at: new Date(product.updated_at).toISOString(),
    };
  }
}

export const apiService = new ApiService();
