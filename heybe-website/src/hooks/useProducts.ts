import { useState, useEffect, useCallback } from "react";
import { productService } from "@/services/productService";
import type { Product, AddProductRequest } from "../types/api.types";

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (productData: AddProductRequest) => Promise<boolean>;
  updateProduct: (
    id: number,
    productData: Partial<AddProductRequest>
  ) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  deleteAllProducts: () => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  clearError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productService.getProducts();

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const addProduct = useCallback(
    async (productData: AddProductRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productService.addProduct(productData);

        if (response.success) {
          await refreshProducts(); // Refresh the list
          return true;
        } else {
          setError(response.message || "Failed to add product");
          return false;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProducts]
  );

  const updateProduct = useCallback(
    async (
      id: number,
      productData: Partial<AddProductRequest>
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productService.updateProduct(id, productData);

        if (response.success) {
          await refreshProducts(); // Refresh the list
          return true;
        } else {
          setError(response.message || "Failed to update product");
          return false;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await productService.deleteProduct(id);

        if (response.success) {
          await refreshProducts(); // Refresh the list
          return true;
        } else {
          setError(response.message || "Failed to delete product");
          return false;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProducts]
  );

  const deleteAllProducts = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await productService.deleteAllProducts();

      if (response.success) {
        setProducts([]); // Clear the list immediately
        return true;
      } else {
        setError(response.message || "Failed to delete all products");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    refreshProducts,
    clearError,
  };
};
