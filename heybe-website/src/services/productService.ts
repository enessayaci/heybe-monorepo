import type {
  Product,
  AddProductRequest,
  FrontendProduct,
  ApiResponse,
} from "../types/api.types";
import { authService } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export class ProductService {
  private static instance: ProductService;

  private constructor() {}

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = authService.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message:
          data.message || (response.ok ? "Success" : "An error occurred"),
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  }

  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<Product[]>("/products");
  }

  async addProduct(
    productData: AddProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(
    id: number,
    productData: Partial<AddProductRequest>
  ): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async deleteAllProducts(): Promise<ApiResponse<void>> {
    return this.makeRequest<void>("/products/all", {
      method: "DELETE",
    });
  }
}

// Singleton instance export
export const productService = ProductService.getInstance();
