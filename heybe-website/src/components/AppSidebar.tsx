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
import { useTranslation } from "../i18n";
import { useAuth } from "@/hooks/useAuth";
import {
  Package,
  Settings,
  User,
  LogIn,
  LogOut,
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
import { useMainStoreBase } from "@/store/main";
import { Button } from "./ui/button";

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
}: AppSidebarProps) {
  const { t, language, changeLanguage } = useTranslation();
  const { logout } = useAuth();
  const user = useMainStoreBase((state) => state.user);

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

  // Logout fonksiyonunu ekle
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div className="relative">
      <Sidebar collapsible="icon">
        {/* Toggle Button - Sidebar içinde, sağ üst köşede sabit */}
        <div className="absolute -right-3 top-4 z-50">
          <Button
            onClick={toggleSidebar}
            variant="secondary"
            className="absolute right-0 top-0 size-7 text-neutral-400 z-50 rounded-full"
            aria-label="Toggle sidebar"
          >
            {open ? (
              <ChevronLeft className="size-6" />
            ) : (
              <ChevronRight className="size-6" />
            )}
          </Button>
        </div>

        <SidebarHeader className="min-h-[48px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="h-12 min-h-[48px]"
              >
                <div className="flex items-center gap-2 h-12 min-h-[48px]">
                  <div className="flex w-8 items-center justify-center rounded-lg">
                    <img className="w-full" src="/logo.png"></img>
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
              <SidebarMenu className="gap-2">
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip open={!open ? undefined : false}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={handleProductsClick}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Package className="!h-5.5 !w-5.5" />
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
                          <Settings className="!h-5.5 !w-5.5" />
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
              <div
                className={`${!open && "border rounded"} ${
                  !open && "border rounded"
                }`}
              >
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
                  <div className=" group-data-[collapsible=icon]:flex group-data-[collapsible=open]:hidden w-full justify-center">
                    <Select
                      value={language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="cursor-pointer w-full h-6 p-0 border-0 bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center [&>svg]:hidden">
                        <SelectValue>
                          <span className="text-lg">
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
            {user && user.is_guest === false ? (
              // Kullanıcı giriş yapmışsa - email ve logout butonu göster
              <>
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip open={!open ? undefined : false}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton className="flex items-center gap-2 cursor-default">
                          <User className="!h-5.5 !w-5.5" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {user.email}
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
                          <p>{user.email}</p>
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
                          onClick={handleLogout}
                          className="flex items-center gap-2 cursor-pointer hover:bg-red-50 hover:text-red-600"
                        >
                          <LogOut className="!h-5.5 !w-5.5" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {t("auth.logout")}
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
                          <p>{t("auth.logout")}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              </>
            ) : (
              // Kullanıcı giriş yapmamışsa - login butonu göster
              <>
                {user && user?.is_guest === true && (
                  <SidebarMenuItem>
                    <TooltipProvider>
                      <Tooltip open={!open ? undefined : false}>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton className="flex items-center gap-2 cursor-default">
                            <User className="h-4 w-4" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {t("auth.guest")}
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
                            <p>{t("auth.guest")}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip open={!open ? undefined : false}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={handleAuthClick}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <LogIn className="!h-5.5 !w-5.5" />
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
              </>
            )}
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </div>
  );
}
