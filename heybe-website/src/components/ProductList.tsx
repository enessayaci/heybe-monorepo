import { useState, useEffect } from "react";
import { productService } from "../services/productService";
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

interface ProductListProps {
  onAddProduct?: () => void;
}

export function ProductList({ onAddProduct }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { t } = useTranslation();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getProducts();

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.message || t("products.errors.loadFailed"));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("products.errors.unexpectedError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await productService.deleteProduct(id);

      if (response.success) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } else {
        setError(response.message || t("products.errors.deleteFailed"));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("products.errors.unexpectedError")
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-destructive mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t("products.errors.title")}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
          <Button onClick={fetchProducts} variant="outline">
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("products.title")}</h1>
          <p className="text-muted-foreground">{t("products.subtitle")}</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t("products.empty.title")}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {t("products.empty.description")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("products.title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("products.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Product cards */}
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow border-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {product.image_urls?.[0] && (
                    <img
                      src={product.image_urls[0]}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.site}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {product.price && (
                    <Badge variant="secondary">{product.price}</Badge>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingId === product.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
