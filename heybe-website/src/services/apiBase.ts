import { useMainStoreBase } from "@/store/main";
import type { ApiResponse } from "../types/api.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeToken: boolean = true
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers: Record<string, any> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Token'ı async olarak al (eğer includeToken true ise)
  if (includeToken) {
    const token = useMainStoreBase.getState().token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      // JSON parse edilemezse
      console.log("Failed to parse JSON response. Falling back to text.", e);

      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok || data.success === false) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      success: true,
      data: data.data || data, // API'nin data alanını desteklemesi durumunda
      message: data.message || "Success",
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      data: undefined,
      message: error instanceof Error ? error.message : "Network error",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: error instanceof Error ? 0 : (error as any).status || 0,
    };
  }
}
