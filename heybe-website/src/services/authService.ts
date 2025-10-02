import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/api.types";
import { makeRequest } from "./apiBase";

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

export async function loginWithTransfer(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  return makeRequest<AuthResponse>("/auth/login-with-transfer", {
    method: "POST",
    body: JSON.stringify(credentials),
  }); // Token eklenmez
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

export async function registerWithTransfer(
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> {
  return makeRequest<AuthResponse>("/auth/register-with-transfer", {
    method: "POST",
    body: JSON.stringify(userData),
  }); // Token eklenmez
}
export async function validateToken(): Promise<ApiResponse<User>> {
  return makeRequest<User>(
    "/auth/validate",
    {
      method: "GET",
    },
    true
  ); // Token eklenir
}
