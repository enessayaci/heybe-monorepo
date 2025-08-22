import { storageService } from "./storageService";
import {
  API_BASE_URL, // type kaldırıldı, artık value import
} from "../types/api.types";
import type {
  User,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/api.types";

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;
  private readonly baseURL = API_BASE_URL;

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${this.token}`;
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

  private saveToStorage(): void {
    if (this.token) {
      localStorage.setItem("auth_token", this.token);
    }
    if (this.user) {
      localStorage.setItem("user_data", JSON.stringify(this.user));
    }
  }

  private loadFromStorage(): void {
    this.token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error("Failed to parse user data from storage:", error);
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    this.token = null;
    this.user = null;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data: AuthResponse = await response.json();

      // Token'ı hem localStorage'a hem extension'a kaydet
      await storageService.saveAuthData({
        token: data.data!.token,
        user: data.data!.user,
        is_guest: false,
      });

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data: AuthResponse = await response.json();

      // Token'ı hem localStorage'a hem extension'a kaydet
      await storageService.saveAuthData({
        token: data.data!.token,
        user: data.data!.user,
        is_guest: false,
      });

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await storageService.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    return await storageService.getUser();
  }

  async getToken(): Promise<string | null> {
    return await storageService.getToken();
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await this.makeRequest("/auth/validate", {
        method: "GET",
      });

      return response.success;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  async isGuest(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.is_guest ?? true;
  }

  // Sync metodları da ekle (useAuth'ta kullanılıyor)
  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = AuthService.getInstance();
export default authService;
