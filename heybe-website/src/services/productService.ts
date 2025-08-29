import { useMainStoreBase } from "@/store/main";
import type {
  Product,
  AddProductRequest,
  ApiResponse,
} from "../types/api.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = useMainStoreBase.getState().token;

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
      message: data.message || (response.ok ? "Success" : "An error occurred"),
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

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return makeRequest<Product[]>("/products");
}

export async function addProduct(
  productData: AddProductRequest
): Promise<ApiResponse<Product>> {
  return makeRequest<Product>("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(
  id: number,
  productData: Partial<AddProductRequest>
): Promise<ApiResponse<Product>> {
  return makeRequest<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id: number): Promise<ApiResponse<void>> {
  return makeRequest<void>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function deleteAllProducts(): Promise<ApiResponse<void>> {
  return makeRequest<void>("/products/all", {
    method: "DELETE",
  });
}
