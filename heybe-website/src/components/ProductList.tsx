import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "../i18n";
import type { Product } from "../types/api.types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Trash2, Link } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useMainStoreBase } from "@/store/main";

interface ProductListProps {
  onAddProduct?: () => void;
  onClickLogin?: () => void;
}

export interface ProductListRef {
  refreshProducts: () => Promise<void>;
}

export const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ onClickLogin }, ref) => {
    const { products, isLoading, error, refreshProducts, deleteProduct } =
      useProducts();
    const [showLoginButton, setLoginButton] = useState(false);
    const token = useMainStoreBase((state) => state.token);
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      refreshProducts,
    }));

    useEffect(() => {
      if (!token) {
        setLoginButton(true);
        return;
      }

      setLoginButton(false);
      refreshProducts();
    }, [token]);

    const handleDeleteProduct = async (id: number) => {
      await deleteProduct(id);
    };

    const handleClickLogin = async () => {
      onClickLogin?.();
    };

    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("products.title")}</h1>
            <p className="text-muted-foreground">{t("products.subtitle")}</p>
          </div>

          <div className="grid gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 border border-accent rounded-md p-2"
                style={{ opacity: `${1 - index / 10}` }}
              >
                <div className="shrink-0">
                  <Skeleton className="h-12 w-12 rounded" />
                </div>

                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-96" />
                  <Skeleton className="h-3 w-70" />
                </div>

                <div className="flex shrink-0 gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("products.title")}</h1>
            <p className="text-muted-foreground">{t("products.subtitle")}</p>
          </div>

          <div className="text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">
                {t("products.errors.loadFailed")}
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={refreshProducts}
                variant="outline"
                className="cursor-pointer"
              >
                {t("common.tryAgain")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (showLoginButton) {
      return (
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">
              {t("products.errors.loginRequired")}
            </h3>
            <Button
              variant="secondary"
              onClick={handleClickLogin}
              className="min-w-24"
            >
              {t("auth.login")}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto">
        <div className="mb-4">
          <h1 className="text-start text-2xl font-bold">
            {t("products.title")}
          </h1>
          <p className="text-start text-muted-foreground">
            {t("products.subtitle")}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              {t("products.noProducts")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("products.noProductsDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 border border-accent rounded-md p-2"
              >
                <div className="flex space-x-0.5 shrink-0 h-12 w-18 bg-muted rounded overflow-hidden">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    product.image_urls.length === 1 ? (
                      <img
                        src={product.image_urls[0]}
                        alt={""}
                        className="flex h-full flex-1 object-cover"
                      />
                    ) : (
                      <>
                        <div className="flex h-full rounded flex-1 bg-muted">
                          <img
                            src={product.image_urls[0]}
                            alt={""}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex h-full flex-1 rounded bg-muted">
                          <img
                            src={product.image_urls[1]}
                            alt={""}
                            className="flex h-full flex-1 object-cover"
                          />
                        </div>
                      </>
                    )
                  ) : (
                    <></>
                  )}
                </div>

                <div className="grid space-y-1 flex-grow">
                  <div className="text-start font-medium truncate">
                    {product.name}
                  </div>
                  <div className="text-start text-sm text-accent-foreground truncate">
                    {product.site}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    onClick={() => handleDeleteProduct(product.id)}
                    variant="danger"
                    size="icon"
                    className="size-8 rounded-full"
                  >
                    <Trash2 />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8 rounded-full"
                  >
                    <Link />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ProductList.displayName = "ProductList";
