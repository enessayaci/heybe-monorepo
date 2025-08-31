import { useMainStoreBase } from "@/store/main";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/api.types";
import { makeRequest } from "./apiBase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// export async function makeRequest<T>(
//   endpoint: string,
//   options: RequestInit = {}
// ): Promise<ApiResponse<T>> {
//   const url = `${API_BASE_URL}${endpoint}`;
//   const headers = {
//     "Content-Type": "application/json",
//     ...options.headers,
//   };

//   // Token'ı async olarak al
//   const token = useMainStoreBase.getState().token;
//   if (token) {
//     (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
//   }

//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers,
//     });

//     const data = await response.json();

//     if(!response.ok || !data.success){
//       throw new Error(data?.message);
//     }

//     return {
//       success: response.ok,
//       data: response.ok ? data : undefined,
//       message: data.message || (response.ok ? "Success" : "An error occurred"),
//       status: response.status,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Network error",
//       status: 0,
//     };
//   }
// }

export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  return makeRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
    false
  ); // Token eklenmez
}

export async function register(
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> {
  return makeRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(userData),
    },
    false
  ); // Token eklenmez
}
export async function validateToken(): Promise<ApiResponse<{}>> {
  return makeRequest<{}>(
    "/auth/validate",
    {
      method: "GET",
    },
    true
  ); // Token eklenir
}
