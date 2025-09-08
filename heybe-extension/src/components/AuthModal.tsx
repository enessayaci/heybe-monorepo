import React, { useEffect, useState } from "react";
import { t } from "../lib/i18n";
import { apiBridge } from "@/services/content.api.bridge";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onAuthSuccess: () => void;
  error?: string; // Yeni prop eklendi
}

export function AuthModal({
  isOpen,
  onClose,
  onContinueAsGuest,
  onAuthSuccess,
  error: externalError, // Dışarıdan gelen hata
}: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "" });

  // External error geldiğinde internal error'u güncelle
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await apiBridge.login(loginData.email, loginData.password);
      if (result.success) {
        onAuthSuccess();
        onClose();
      } else {
        setError(result.message || t("authLoginFailed"));
      }
    } catch (err) {
      setError(t("commonNetworkError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await apiBridge.register(
        registerData.email,
        registerData.password
      );
      if (result.success) {
        onAuthSuccess();
        onClose();
      } else {
        setError(result.message || t("authRegisterFailed"));
      }
    } catch (err) {
      setError(t("commonNetworkError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    onClose();
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    width: "400px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  };

  const tabsStyle = {
    display: "flex",
    marginBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
  };

  const tabStyle = (isActive: boolean) => ({
    flex: 1,
    padding: "12px 16px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
    color: isActive ? "#3b82f6" : "#6b7280",
    fontWeight: isActive ? "600" : "400",
    fontSize: "14px",
  });

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "16px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.7 : 1,
    marginBottom: "12px",
  };

  const outlineButtonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "transparent",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.7 : 1,
  };

  const errorStyle = {
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "12px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {t("authLoginRegister")}
        </h2>

        <div style={tabsStyle}>
          <button
            style={tabStyle(activeTab === "login")}
            onClick={() => setActiveTab("login")}
          >
            {t("authLogin")}
          </button>
          <button
            style={tabStyle(activeTab === "register")}
            onClick={() => setActiveTab("register")}
          >
            {t("authRegister")}
          </button>
        </div>

        {activeTab === "login" && (
          <form onSubmit={handleLogin}>
            <label style={labelStyle}>{t("authEmail")}</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
              disabled={isLoading}
              style={inputStyle}
              placeholder={t("authEmailPlaceholder")}
            />

            <label style={labelStyle}>{t("authPassword")}</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
              disabled={isLoading}
              style={inputStyle}
              placeholder={t("authPasswordPlaceholder")}
            />

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? t("commonLoading") : t("authLogin")}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister}>
            <label style={labelStyle}>{t("authEmail")}</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              required
              disabled={isLoading}
              style={inputStyle}
              placeholder={t("authEmailPlaceholder")}
            />

            <label style={labelStyle}>{t("authPassword")}</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              required
              disabled={isLoading}
              style={inputStyle}
              placeholder={t("authPasswordPlaceholder")}
            />

            {error && <div style={errorStyle}>{error}</div>}

            <button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? t("commonLoading") : t("authRegister")}
            </button>
          </form>
        )}

        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
            marginTop: "16px",
          }}
        >
          <button
            style={outlineButtonStyle}
            onClick={handleContinueAsGuest}
            disabled={isLoading}
          >
            {t("authContinueAsGuest")}
          </button>
        </div>
      </div>
    </div>
  );
}
