import {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { useTranslation } from "../i18n";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Trash2,
  Link,
  LogInIcon,
  TriangleAlert,
  PackageOpenIcon,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useMainStoreBase } from "@/store/main";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { type Product } from "@/types/api.types";

interface ProductListProps {
  onAddProduct?: () => void;
  onClickLogin?: () => void;
}

export interface ProductListRef {
  refreshProducts: () => Promise<void>;
}

export const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ onClickLogin }, ref) => {
    const {
      products,
      isLoading,
      error,
      refreshProducts,
      deleteProduct,
      deleteAllProducts,
    } = useProducts();
    const [showLoginButton, setLoginButton] = useState(false);
    const token = useMainStoreBase((state) => state.token);
    const { t } = useTranslation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [productNameToDelete, setProductNameToDelete] = useState<
      string | null
    >(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
      null
    );

    // Minimal istatistikler
    const calculateStats = () => {
      const totalProducts = filteredProducts.length;
      const uniqueSites = [...new Set(filteredProducts.map((p) => p.site))]
        .length;
      return { totalProducts, uniqueSites };
    };

    const stats = useCallback(calculateStats, [filteredProducts])();

    useImperativeHandle(ref, () => ({
      refreshProducts,
    }));

    // Arama fonksiyonu - debounce ile
    const handleSearch = (value: string) => {
      setSearchTerm(value);

      // Önceki timeout'u temizle
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Yeni timeout ayarla
      const newTimeout = setTimeout(() => {
        if (value.trim() === "") {
          setFilteredProducts(products);
        } else {
          const filtered = products.filter((product) => {
            const searchLower = value.toLowerCase();
            return (
              product.name.toLowerCase().includes(searchLower) ||
              product.site.toLowerCase().includes(searchLower)
            );
          });
          setFilteredProducts(filtered);
        }
      }, 500);

      setSearchTimeout(newTimeout);
    };

    useEffect(() => {
      if (!token) {
        setLoginButton(true);
        return;
      }

      setLoginButton(false);
      refreshProducts();
    }, [refreshProducts, token]);

    useEffect(() => {
      if (products) {
        setFilteredProducts(products);
      }
    }, [products]);

    function handleDeleteModalAction() {
      setIsDeleteModalOpen(false);
      if (productToDelete) deleteProduct(productToDelete);
      setProductToDelete(null);
      setProductNameToDelete(null);
    }

    const handleClickLogin = async () => {
      onClickLogin?.();
    };

    if (isLoading) {
      return (
        <div className="container mx-auto ">
          <div className="mb-2">
            <h1 className="text-2xl text-start font-semibold">
              {t("products.title")}
            </h1>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 min-w-80" />

              <div className="flex space-x-4 items-center mt-auto">
                <Skeleton className="h-5 w-24" />

                <span className="p-0.75 rounded-full bg-gray-200"></span>

                <Skeleton className="h-5 w-24" />
              </div>

              <Skeleton className="ms-auto h-9 w-28" />
            </div>
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
        <div className="container mx-auto">
          <div className="mb-2">
            <h1 className="text-start text-2xl font-semibold">
              {t("products.title")}
            </h1>
          </div>

          <div className="py-6 flex items-center">
            <TriangleAlert size={56}></TriangleAlert>
            <div className="ms-4">
              <h3 className="text-lg text-start font-semibold">
                {t("products.errors.loginRequired")}
              </h3>
              <p className="text-muted-foreground text-start items-center flex">
                {t("products.errors.loginRequiredDescription")}
                <Button
                  variant="outline"
                  onClick={handleClickLogin}
                  className="ms-2 font-semibold"
                >
                  <LogInIcon className="size-4" />
                  {t("auth.login")}
                </Button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="container mx-auto">
          <div className="mb-2">
            <h1 className="text-start text-2xl font-semibold">
              {t("products.title")}
            </h1>
          </div>

          {filteredProducts.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-4">
                {/* Arama Kutusu - Sol */}
                <div className="min-w-80">
                  <Input
                    type="text"
                    placeholder={t("products.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div className="flex space-x-4 items-center mt-auto">
                  <p className="text-sm text-start text-gray-500 flex items-center">
                    <span>
                      {t("products.searchResultsFound", {
                        count: stats.totalProducts,
                      })}
                    </span>
                  </p>

                  <span className="p-0.75 rounded-full bg-gray-500"></span>

                  <p className="text-sm text-start text-gray-500 flex items-center">
                    <span>
                      {t("products.differentSites", {
                        count: stats.uniqueSites,
                      })}
                    </span>
                  </p>
                </div>

                <div className="flex-shrink-0 ms-auto">
                  <Button onClick={deleteAllProducts} variant="danger">
                    {t("products.deleteAll")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="py-6 flex">
              <PackageOpenIcon className="" size={56}></PackageOpenIcon>
              <div className="ms-4">
                <h3 className="text-lg text-start font-semibold">
                  {t("products.noProducts")}
                </h3>
                <p className="text-muted-foreground">
                  {t("products.noProductsDescription")}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredProducts.map((product, index) => (
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
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setProductToDelete(product.id);
                        setProductNameToDelete(product.name);
                      }}
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
                      onClick={() => window.open(product.url, "_blank")}
                    >
                      <Link />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={(value) => setIsDeleteModalOpen(value)}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>{t("products.deleteConfirm.title")}</DialogTitle>
              <DialogDescription>
                {t("products.deleteConfirm.description", {
                  productName: productNameToDelete,
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="ghost"
              >
                {t("common.cancel")}
              </Button>
              <Button variant="danger" onClick={handleDeleteModalAction}>
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ProductList.displayName = "ProductList";
