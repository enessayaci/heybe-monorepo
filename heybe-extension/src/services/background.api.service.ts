import type {
  Product,
  AddProductRequest,
  ApiResponse,
  AuthResponse,
} from "./api.types";

import { getToken } from "./storage.service";

class ApiService {
  private readonly baseUrl = "https://heybe-monorepo.onrender.com/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await getToken();

    console.log("endpoint: ", endpoint);
    console.log("token sending to endpoint: ", token);

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log("endpoint config: ", config);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      console.log("response coming from endpoint: ", response);

      let data = null;
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        try {
          data = await response.json();
        } catch (error) {
          console.log(
            "Failed to parse JSON response. Falling back to text.",
            error
          );
          const text = await response.text();
          console.log("Response body as text: ", text);
        }
      } else {
        console.log(
          "Response is not JSON. Content-Type: ",
          response.headers.get("Content-Type")
        );
        const text = await response.text();
        console.log("Response body as text: ", text);
      }

      if (!response.ok) {
        throw Object.assign(new Error(data?.message || "Request failed"), {
          status: response.status,
        });
      }

      return {
        success: true,
        data: data?.data || data,
        status: response.status,
      };
    } catch (error) {
      console.log("error coming from endpoint: ", error);

      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error",
        status:
          error instanceof Error && "status" in error
            ? (error.status as number)
            : undefined,
      };
    }
  }

  // Guest token oluşturma
  async createGuestToken(): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/guest", {
      method: "POST",
    });
  }

  // Ürün ekleme
  async addProduct(
    productData: AddProductRequest
  ): Promise<ApiResponse<Product>> {
    console.log("productData coming as paramter: ", productData);

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
}

export const apiService = new ApiService();
