import { useMainStoreBase } from "@/store/main";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/api.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Token'ı async olarak al
  const token = useMainStoreBase.getState().token;
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

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
        data: undefined,
      };
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error",
      data: undefined,
    };
  }
}

export async function register(
  userData: RegisterRequest
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed",
        data: undefined,
      };
    }

    return data;
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Network error",
      data: undefined,
    };
  }
}

export async function validateToken(): Promise<boolean> {
  try {
    const token = useMainStoreBase.getState().token;
    if (!token) return false;

    const response = await makeRequest<{}>("/auth/validate", {
      method: "GET",
    });

    if (response.success && response.data) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}
