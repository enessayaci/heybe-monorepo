import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

function Sidebar({
  onScrollToSection,
  onToggle,
  currentUserId,
  userRole,
  isLoggedIn,
  onLogin,
  onRegister,
  onLogout,
  checkExtensionAvailability,
  currentLanguage,
  onLanguageChange,
  t,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" veya "register"
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    }
  };

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onToggle) {
      onToggle(newCollapsed);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError("");

    try {
      let result;
      if (authMode === "login") {
        result = await onLogin(authData.email, authData.password);
      } else {
        result = await onRegister(
          authData.email,
          authData.password,
          authData.name
        );
      }

      if (result.success) {
        setShowAuthForm(false);
        setAuthData({ email: "", password: "", name: "" });
      } else {
        setAuthError(result.message);
      }
    } catch (error) {
      setAuthError("Bir hata oluştu");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Auth butonları - extension kontrolü yok (extension olmadan da giriş yapılabilir)
  const handleAuthButtonClick = async (mode) => {
    // Direkt formu göster
    setAuthMode(mode);
    setShowAuthForm(true);
  };

  const handleLogout = async () => {
    const result = await onLogout();
    if (result.success) {
      setShowAuthForm(false);
    }
  };

  const menuItems = [
    {
      id: "products",
      icon: "📦",
      label: t("products"),
      action: () => scrollToSection("products"),
    },
    {
      id: "install",
      icon: "📋",
      label: t("install"),
      action: () => scrollToSection("install"),
    },
    // Sadece admin kullanıcılar için "Geliştirici" menüsü
    ...(userRole === "admin"
      ? [
          {
            id: "technical",
            icon: "🔧",
            label: t("developer"),
            action: () => scrollToSection("technical"),
          },
        ]
      : []),
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button - Position Absolute */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="absolute -right-3 top-4 p-2 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Shopping Basket"
            className="w-6 h-6 flex-shrink-0"
          />
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-gray-900 ml-2 flex-shrink-0">
              Heybe
            </h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`${isCollapsed ? "px-0 py-4" : "p-4"} space-y-2 flex-1`}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`relative group ${
              isCollapsed ? "flex justify-center" : ""
            }`}
          >
            <Button
              variant="ghost"
              onClick={item.action}
              className={`w-full justify-start h-9 ${
                isCollapsed
                  ? "w-12 flex items-center justify-center mx-0"
                  : "px-4"
              }`}
            >
              <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="ml-3 flex-shrink-0">{item.label}</span>
              )}
            </Button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Auth Section */}
      <div
        className={`p-4 border-t border-gray-200 bg-gray-50 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {!isLoggedIn ? (
          // Login/Register Buttons
          <div
            className={`space-y-2 ${
              isCollapsed ? "flex flex-col items-center" : ""
            }`}
          >
            {!showAuthForm ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAuthButtonClick("login")}
                  className={`w-full ${isCollapsed ? "w-10 h-10 p-0" : ""}`}
                >
                  {isCollapsed ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("login")}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAuthButtonClick("register")}
                  className={`w-full ${isCollapsed ? "w-10 h-10 p-0" : ""}`}
                >
                  {isCollapsed ? (
                    <UserPlus className="w-4 h-4" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("register")}
                    </>
                  )}
                </Button>
              </>
            ) : (
              // Auth Form
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                {authMode === "register" && (
                  <input
                    type="text"
                    placeholder={t("namePlaceholder")}
                    value={authData.name}
                    onChange={(e) =>
                      setAuthData({ ...authData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                )}
                {authError && (
                  <p className="text-red-500 text-xs">{authError}</p>
                )}
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAuthLoading}
                    className="flex-1"
                  >
                    {isAuthLoading
                      ? "..."
                      : authMode === "login"
                      ? t("loginShort")
                      : t("registerShort")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAuthForm(false)}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          // Logout Button
          <div className={`${isCollapsed ? "flex justify-center" : ""}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={`w-full ${isCollapsed ? "w-10 h-10 p-0" : ""}`}
            >
              {isCollapsed ? (
                <LogOut className="w-4 h-4" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Aktif Kullanıcı - En alt */}
      <div
        className={`p-4 border-t border-gray-200 bg-gray-50 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {/* Language Selector */}
        <div className={`mb-4 ${isCollapsed ? "px-2" : "px-3"}`}>
          {!isCollapsed && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {t("language")}
              </label>
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tr">🇹🇷 {t("turkish")}</option>
                <option value="en">🇬🇧 {t("english")}</option>
              </select>
            </div>
          )}
          {isCollapsed && (
            <div className="relative group">
              <button
                onClick={() =>
                  onLanguageChange(currentLanguage === "tr" ? "en" : "tr")
                }
                className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-100 rounded-md transition-colors"
                title={t("language")}
              >
                {currentLanguage === "tr" ? "🇹🇷" : "🇬🇧"}
              </button>
              <div className="absolute left-full ml-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
                {t("language")}:{" "}
                {currentLanguage === "tr" ? t("turkish") : t("english")}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : ""
          } relative group`}
        >
          <span className="text-sm text-gray-600">👤</span>
          {!isCollapsed && (
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">
                {isLoggedIn ? t("loggedIn") : t("guest")}
              </p>
              <p className="text-xs text-gray-700 truncate font-mono">
                {currentUserId ? `${currentUserId.substring(0, 8)}...` : "N/A"}
              </p>
            </div>
          )}

          {/* Tooltip for full UUID */}
          {currentUserId && (
            <div className="absolute left-full ml-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
              {currentUserId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
