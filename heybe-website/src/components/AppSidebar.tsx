import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";
import { Badge } from "./ui/badge";
import { useTranslation } from "../i18n";
import { useAuth } from "../hooks/useAuth";
import {
  Package,
  Settings,
  User,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AppSidebarProps = {
  onScrollToProducts: () => void;
  onOpenInstallModal: () => void;
  onOpenAuthModal: () => void;
  hasExtension?: boolean;
};

export function AppSidebar({ 
  onScrollToProducts, 
  onOpenInstallModal, 
  onOpenAuthModal,
  hasExtension = false 
}: AppSidebarProps) {
  const { t, language, changeLanguage } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { open, setOpen } = useSidebar();

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onScrollToProducts();
  };

  const handleSetupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenInstallModal();
  };

  const handleAuthClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenAuthModal();
  };

  const handleLanguageChange = (value: string) => {
    changeLanguage(value as "tr" | "en");
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div className="relative">
      <Sidebar collapsible="icon">
        {/* Toggle Button - Sidebar içinde, sağ üst köşede sabit */}
        <div className="absolute -right-3 top-4 z-50">
          <button
            onClick={toggleSidebar}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {open ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        </div>

        <SidebarHeader className="min-h-[48px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="h-12 min-h-[48px]">
                <div className="flex items-center gap-2 h-12 min-h-[48px]">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Package className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">Heybe</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip open={!open ? undefined : false}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={handleProductsClick}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Package className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {t("products.myProducts")}
                          </span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {!open && (
                        <TooltipContent
                          side="right"
                          className="bg-white border border-gray-200 shadow-lg rounded-md px-3 py-2 text-sm font-medium text-gray-900"
                          sideOffset={8}
                          hideWhenDetached
                        >
                          <p>{t("products.myProducts")}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip open={!open ? undefined : false}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={handleSetupClick}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {t("setup.title")}
                          </span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {!open && (
                        <TooltipContent
                          side="right"
                          className="bg-white border border-gray-200 shadow-lg rounded-md px-3 py-2 text-sm font-medium text-gray-900"
                          sideOffset={8}
                          hideWhenDetached
                        >
                          <p>{t("setup.title")}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-2">
                {/* Açık sidebar için normal select */}
                <div className="group-data-[collapsible=open]:!block group-data-[collapsible=icon]:!hidden">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {language === "tr" ? "🇹🇷" : "🇺🇸"}
                          </span>
                          <span>
                            {language === "tr" ? "Türkçe" : "English"}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="tr" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇹🇷</span>
                          <span>Türkçe</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Kapalı sidebar için sadece bayrak */}
                {!open && (
                  <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=open]:hidden w-full justify-center">
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="cursor-pointer w-6 h-6 p-0 border-0 bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center [&>svg]:hidden">
                        <SelectValue>
                          <span className="text-base">
                            {language === "tr" ? "🇹🇷" : "🇺🇸"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="tr" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇹🇷</span>
                            <span>Türkçe</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="en" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇺🇸</span>
                            <span>English</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {isAuthenticated && user && (
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    {user.email}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!isAuthenticated && (
              <SidebarMenuItem>
                <TooltipProvider>
                  <Tooltip open={!open ? undefined : false}>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        onClick={handleAuthClick}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {t("auth.loginRegister")}
                        </span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {!open && (
                      <TooltipContent
                        side="right"
                        className="bg-white border border-gray-200 shadow-lg rounded-md px-3 py-2 text-sm font-medium text-gray-900 [&>*:last-child]:hidden"
                        sideOffset={8}
                        hideWhenDetached
                      >
                        <p>{t("auth.loginRegister")}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
        
        {/* Extension durumunu göster */}
        {hasExtension && (
          <div className="px-3 py-2 border-t">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Extension Active
            </Badge>
          </div>
        )}

        <SidebarRail />
      </Sidebar>
    </div>
  );
}
