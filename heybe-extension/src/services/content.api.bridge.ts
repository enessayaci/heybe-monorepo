import { sendMessage } from "webext-bridge/content-script";
import type {
  ApiResponse,
  AuthResponse,
  Product,
  AddProductRequest,
} from "./api.types";
import { type apiService } from "./background.api.service";

class ContentApiBridge {
  private static instance: ContentApiBridge | null = null;
  private onUnauthorized?: (errorMessage?: string) => void;

  private constructor() {}

  // API çağrıları için yardımcı fonksiyon
  async callApi<T>(
    method: keyof typeof apiService,
    params: unknown[] = []
  ): Promise<ApiResponse<T>> {
    try {
      const response: ApiResponse<any> = (await sendMessage("apiCall", {
        method,
        params: params as any,
      })) as unknown as ApiResponse<any>;

      // 401 hatası durumunda token'ı sil ve callback çağır
      if (response.status === 401) {
        const errorMessage = response.message || "Kimlik doğrulama hatası";
        this.handleUnauthorized(errorMessage);
      }

      return response as unknown as ApiResponse<T>;
    } catch (error) {
      console.error(`Error calling API method ${method}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public static getInstance(): ContentApiBridge {
    if (!ContentApiBridge.instance) {
      ContentApiBridge.instance = new ContentApiBridge();
    }
    return ContentApiBridge.instance;
  }

  // 401 hatası durumunda çağrılacak callback'i set etme
  setUnauthorizedCallback(callback: (errorMessage?: string) => void) {
    this.onUnauthorized = callback;
  }

  // Background ile iletişim kuran arayüz
  // Misafir token oluşturma
  public async createGuestToken(): Promise<ApiResponse<AuthResponse>> {
    return this.callApi<AuthResponse>("createGuestToken");
  }

  // Ürün ekleme
  public async addProduct(
    productData: AddProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.callApi<Product>("addProduct", [productData]);
  }

  // Kullanıcı girişi
  public async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.callApi<AuthResponse>("login", [email, password]);
  }

  // Kullanıcı kaydı
  public async register(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.callApi<AuthResponse>("register", [email, password]);
  }

  // Misafir transferi ile giriş
  public async loginWithGuestTransfer(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.callApi<AuthResponse>("loginWithGuestTransfer", [
      email,
      password,
    ]);
  }

  // Misafir transferi ile kayıt
  public async registerWithGuestTransfer(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return this.callApi<AuthResponse>("registerWithGuestTransfer", [
      email,
      password,
    ]);
  }

  private async handleUnauthorized(errorMessage?: string) {
    try {
      // Storage'ı tamamen temizle - ilk yükleme gibi
      await sendMessage("clearStorage", {}, "background");

      // Auth modal'ı aç ve hata mesajını göster
      if (this.onUnauthorized) {
        this.onUnauthorized(errorMessage);
      }
    } catch (error) {
      console.error("Error handling unauthorized:", error);
    }
  }
}

export const apiBridge = ContentApiBridge.getInstance();
