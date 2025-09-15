import { useState } from "react";
import { useTranslation } from "@/i18n/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, XIcon } from "lucide-react";
import { useLoadingGlobalStore } from "@/store/LoadingGlobal";

type AuthMode = "login" | "register";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  defaultMode?: AuthMode;
};

type FormData = {
  email: string;
  password: string;
};

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = "login",
}: AuthModalProps) {
  const { t } = useTranslation();
  const { showLoading, hideLoading } = useLoadingGlobalStore();
  const { login, register, isLoading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthMode>(defaultMode);
  const [loginData, setLoginData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    showLoading();
    e.preventDefault();
    clearError();

    const success = await login({
      email: loginData.email,
      password: loginData.password,
    });

    if (success) {
      onAuthSuccess();
      onClose();
    }

    hideLoading();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await register({
      email: registerData.email,
      password: registerData.password,
    });

    if (success) {
      onAuthSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    clearError();
    setLoginData({ email: "", password: "" });
    setRegisterData({ email: "", password: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md bg-white">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-lg font-semibold">
            {t("auth.loginRegister")}
          </DialogTitle>
          <DialogClose className="absolute -top-4 -end-4" asChild>
            <Button
              type="button"
              size="icon"
              variant="danger"
              className="size-8 rounded-full"
            >
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0 space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "login"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("auth.login")}
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "register"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("auth.register")}
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common.email")}
                  </label>
                  <Input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    placeholder={t("auth.emailRequired")}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common.password")}
                  </label>
                  <Input
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder={t("auth.passwordRequired")}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="secondary"
                  type="submit"
                  className="w-full "
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("auth.login")}
                </Button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common.email")}
                  </label>
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    placeholder={t("auth.emailRequired")}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("common.password")}
                  </label>
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    placeholder={t("auth.passwordRequired")}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="secondary"
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("auth.register")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
