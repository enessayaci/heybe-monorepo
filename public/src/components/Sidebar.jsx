import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar({ onScrollToSection, onToggle, currentUserId }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const menuItems = [
    {
      id: "products",
      icon: "📦",
      label: "Ürünlerim",
      action: () => scrollToSection("products"),
    },
    {
      id: "install",
      icon: "📋",
      label: "Kurulum",
      action: () => scrollToSection("install"),
    },
    {
      id: "uninstall",
      icon: "🗑️",
      label: "Kaldırma",
      action: () => scrollToSection("uninstall"),
    },
    {
      id: "technical",
      icon: "🔧",
      label: "Geliştirici",
      action: () => scrollToSection("technical"),
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-50 ${
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
          <span className="text-xl flex-shrink-0">🛒</span>
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-gray-900 ml-2 flex-shrink-0">
              Tüm Listem
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

      {/* Aktif Kullanıcı - En alt */}
      {currentUserId && (
        <div className={`p-4 border-t border-gray-200 bg-gray-50 ${
          isCollapsed ? "px-2" : "px-4"
        }`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
            <span className="text-sm text-gray-600">👤</span>
            {!isCollapsed && (
              <div className="ml-2 flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Aktif Kullanıcı</p>
                <p className="text-xs text-gray-700 truncate font-mono">
                  {currentUserId.substring(0, 8)}...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
