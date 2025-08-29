import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "../i18n";
import type { Product } from "../types/api.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
import { Trash2 } from "lucide-react";
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
  ({ onAddProduct, onClickLogin }, ref) => {
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
      refreshProducts;
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-4">
                  <div className="flex justify-between items-center w-full">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardFooter>
              </Card>
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

          <div className="text-center py-12">
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
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">
              {t("products.errors.loginRequired")}
            </h3>
            <Button
              onClick={handleClickLogin}
              variant="outline"
              className="cursor-pointer"
            >
              {t("auth.login")}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("products.title")}</h1>
              <p className="text-muted-foreground">{t("products.subtitle")}</p>
            </div>
            {onAddProduct && (
              <Button onClick={onAddProduct}>{t("products.addProduct")}</Button>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              {t("products.noProducts")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("products.noProductsDescription")}
            </p>
            {onAddProduct && (
              <Button onClick={onAddProduct}>
                {t("products.addFirstProduct")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(products) &&
              products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {product.image_urls && product.image_urls.length > 0 && (
                        <img
                          src={product.image_urls[0]}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight truncate">
                          {product.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {product.site}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.url}
                    </p>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="text-xs w-fit">
                          {product.site}
                        </Badge>
                        {product.price && (
                          <span className="text-sm font-medium">
                            ${product.price}
                          </span>
                        )}
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("products.deleteConfirm.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("products.deleteConfirm.description", {
                                productName: product.name,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("common.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        )}
      </div>
    );
  }
);

ProductList.displayName = "ProductList";
