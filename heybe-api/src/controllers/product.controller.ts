import { Request, Response } from "express";
import {
  createProduct,
  getProductsByUserId,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteAllUserProducts as deleteAllProducts,
  getProductsBySite,
  CreateProductData,
  UpdateProductData,
} from "../services/product.service";
import { AuthRequest } from "@/types/auth.types";

export const addProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, image_urls, url, site } = req.body;
    const tokenUserId = req.user!.id;

    // Sadece URL zorunlu - null/undefined kontrolü
    if (url == null) {
      return res.status(400).json({
        success: false,
        message: "URL alanı gereklidir",
      });
    }

    // URL için boş string kontrolü (zorunlu alan)
    if (typeof url === "string" && url.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "URL boş olamaz",
      });
    }

    // URL format kontrolü
    if (typeof url === "string" && url.trim() !== "") {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(url)) {
        return res.status(400).json({
          success: false,
          message: "Geçerli bir URL giriniz (http:// veya https:// ile başlamalı)",
        });
      }
    }

    // Image URLs array kontrolü
    if (image_urls != null && !Array.isArray(image_urls)) {
      return res.status(400).json({
        success: false,
        message: "image_urls bir dizi olmalıdır",
      });
    }

    // Price işleme - null/undefined/boş string durumlarını ele al
    const processedPrice = (() => {
      if (price == null) return 0;
      if (typeof price === "number") return price;
      if (typeof price === "string") {
        const trimmed = price.trim();
        if (trimmed === "") return 0;
        const parsed = parseFloat(trimmed);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    })();

    const productData: CreateProductData = {
      user_id: tokenUserId,
      name: name && typeof name === "string" ? name.trim() : name || "",
      price: processedPrice.toString(),
      image_urls: image_urls || [],
      url: typeof url === "string" ? url.trim() : url,
      site: site && typeof site === "string" ? site.trim() : site || "",
    };

    const newProduct = await createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Ürün başarıyla eklendi",
      data: newProduct,
    });
  } catch (error) {
    console.error("Ürün ekleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// STANDART: Token'dan user_id al, parametre ile doğrula
export const getUserProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const tokenUserId = req.user!.id; // Token'dan user_id

    // Parametre kontrolü (opsiyonel güvenlik katmanı)
    if (userId && parseInt(userId) !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "Bu kullanıcının ürünlerine erişim yetkiniz yok",
      });
    }

    // Her zaman token'dan gelen user_id'yi kullan
    const products = await getProductsByUserId(tokenUserId);

    res.status(200).json({
      success: true,
      message: "Ürünler başarıyla getirildi",
      data: products,
    });
  } catch (error) {
    console.error("Ürünleri getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// STANDART: Token'dan user_id al, ürün sahipliğini kontrol et
export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tokenUserId = req.user!.id; // Token'dan user_id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Ürün ID gereklidir",
      });
    }

    const product = await getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    // Ürün sahipliği kontrolü
    if (product.user_id !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "Bu ürüne erişim yetkiniz yok",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ürün başarıyla getirildi",
      data: product,
    });
  } catch (error) {
    console.error("Ürün getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// STANDART: Token'dan user_id al, ürün sahipliğini kontrol et
export const updateUserProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, image_urls, url, site } = req.body; // title yerine name
    const tokenUserId = req.user!.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Ürün ID gereklidir",
      });
    }

    // Önce ürünü getir ve sahipliğini kontrol et
    const existingProduct = await getProductById(parseInt(id));
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    // Ürün sahipliği kontrolü
    if (existingProduct.user_id !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "Bu ürünü güncelleme yetkiniz yok",
      });
    }

    // URL format kontrolü
    if (url) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(url)) {
        return res.status(400).json({
          success: false,
          message:
            "Geçerli bir URL giriniz (http:// veya https:// ile başlamalı)",
        });
      }
    }

    // Image URLs array kontrolü
    if (image_urls && !Array.isArray(image_urls)) {
      return res.status(400).json({
        success: false,
        message: "image_urls bir dizi olmalıdır",
      });
    }

    const updateData: UpdateProductData = {};
    if (name !== undefined) updateData.name = name; // title yerine name
    if (price !== undefined) updateData.price = price;
    if (image_urls !== undefined) updateData.image_urls = image_urls;
    if (url !== undefined) updateData.url = url;
    if (site !== undefined) updateData.site = site;

    // Token'dan gelen user_id'yi kullan
    const updatedProduct = await updateProduct(
      parseInt(id),
      tokenUserId,
      updateData
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı veya güncelleme yetkisi yok",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ürün başarıyla güncellendi",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Ürün güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// STANDART: Token'dan user_id al, ürün sahipliğini kontrol et
export const deleteUserProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tokenUserId = req.user!.id; // Token'dan user_id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Ürün ID gereklidir",
      });
    }

    // Önce ürünü getir ve sahipliğini kontrol et
    const existingProduct = await getProductById(parseInt(id));
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı",
      });
    }

    // Ürün sahipliği kontrolü
    if (existingProduct.user_id !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "Bu ürünü silme yetkiniz yok",
      });
    }

    // Token'dan gelen user_id'yi kullan
    const deleted = await deleteProduct(parseInt(id), tokenUserId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Ürün bulunamadı veya silme yetkisi yok",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ürün başarıyla silindi",
    });
  } catch (error) {
    console.error("Ürün silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// STANDART: Token'dan user_id al
export const getProductsBySiteFilter = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { site } = req.params;
    const tokenUserId = req.user!.id; // Token'dan user_id

    if (!site) {
      return res.status(400).json({
        success: false,
        message: "Site parametresi gereklidir",
      });
    }

    // Token'dan gelen user_id ile sadece kendi ürünlerini getir
    const allProducts = await getProductsByUserId(tokenUserId);
    const products = allProducts.filter((product) => product.site === site);

    res.status(200).json({
      success: true,
      message: "Site bazında ürünler başarıyla getirildi",
      data: products,
    });
  } catch (error) {
    console.error("Site bazında ürün getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// STANDART: Token'dan user_id al
export const deleteAllUserProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tokenUserId = req.user!.id; // Token'dan user_id

    // Token'dan gelen user_id'yi kullan
    const result = await deleteAllProducts(tokenUserId);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} ürün başarıyla silindi`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Tüm ürünleri silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// Basit ürün listesi endpoint'i - sadece token'dan user_id kullan
export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const tokenUserId = req.user!.id; // Token'dan user_id

    const products = await getProductsByUserId(tokenUserId);

    res.status(200).json({
      success: true,
      message: "Ürünler başarıyla getirildi",
      data: products,
    });
  } catch (error) {
    console.error("Ürünleri getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};
