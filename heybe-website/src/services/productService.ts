import type {
  Product,
  AddProductRequest,
  ApiResponse,
} from "../types/api.types";
import { makeRequest } from "./apiBase";

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
