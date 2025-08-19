import { pool } from "../database/db";

export interface Product {
  id: number;
  user_id: number;
  name: string;
  price: string;
  image_urls: string[];
  url: string;
  site: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  user_id: number;
  name: string;
  price: string;
  image_urls: string[];
  url: string;
  site: string;
}

export interface UpdateProductData {
  name?: string;
  price?: string;
  image_urls?: string[];
  url?: string;
  site?: string;
}

export const createProduct = async (
  productData: CreateProductData
): Promise<Product> => {
  const { user_id, name, price, image_urls, url, site } = productData;

  const query = `
    INSERT INTO products (user_id, name, price, image_urls, url, site, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [
    user_id,
    name,
    price,
    image_urls,
    url,
    site,
  ]);
  return result.rows[0];
};

export const getProductsByUserId = async (
  userId: number
): Promise<Product[]> => {
  const query =
    "SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(query, [userId]);

  return result.rows;
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const query = "SELECT * FROM products WHERE id = $1";
  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

export const updateProduct = async (
  id: number,
  userId: number,
  updateData: UpdateProductData
): Promise<Product | null> => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updateData.name !== undefined) {
    fields.push(`name = $${paramCount}`);
    values.push(updateData.name);
    paramCount++;
  }

  if (updateData.price !== undefined) {
    fields.push(`price = $${paramCount}`);
    values.push(updateData.price);
    paramCount++;
  }

  if (updateData.image_urls !== undefined) {
    fields.push(`image_urls = $${paramCount}`);
    values.push(updateData.image_urls);
    paramCount++;
  }

  if (updateData.url !== undefined) {
    fields.push(`url = $${paramCount}`);
    values.push(updateData.url);
    paramCount++;
  }

  if (updateData.site !== undefined) {
    fields.push(`site = $${paramCount}`);
    values.push(updateData.site);
    paramCount++;
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const query = `
    UPDATE products 
    SET ${fields.join(", ")}
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteProduct = async (
  id: number,
  userId: number
): Promise<boolean> => {
  const query = "DELETE FROM products WHERE id = $1 AND user_id = $2";
  const result = await pool.query(query, [id, userId]);

  return result.rowCount !== null && result.rowCount > 0;
};

// Yeni fonksiyon: Kullanıcının tüm ürünlerini sil
export const deleteAllUserProducts = async (
  userId: number
): Promise<{ success: boolean; deletedCount: number }> => {
  const query = "DELETE FROM products WHERE user_id = $1";
  const result = await pool.query(query, [userId]);

  return {
    success: true,
    deletedCount: result.rowCount || 0
  };
};

// Mevcut fonksiyonu değiştir:
export const getProductsBySite = async (site: string): Promise<Product[]> => {
  const query = 'SELECT * FROM products WHERE site = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [site]);
  return result.rows;
};

// Ürün transfer fonksiyonu
export const transferProductsFromGuestToUser = async (
  guestUserId: number,
  targetUserId: number
): Promise<{ success: boolean; transferredCount: number }> => {
  try {
    // Önce transfer edilecek ürün sayısını kontrol et
    const checkQuery = "SELECT COUNT(*) as count FROM products WHERE user_id = $1";
    const checkResult = await pool.query(checkQuery, [guestUserId]);
    const productCount = parseInt(checkResult.rows[0].count);

    if (productCount === 0) {
      return {
        success: true,
        transferredCount: 0
      };
    }

    // Ürünleri transfer et
    const transferQuery = "UPDATE products SET user_id = $1 WHERE user_id = $2";
    const transferResult = await pool.query(transferQuery, [targetUserId, guestUserId]);

    console.log(`✅ ${transferResult.rowCount} ürün transfer edildi: ${guestUserId} → ${targetUserId}`);

    return {
      success: true,
      transferredCount: transferResult.rowCount || 0
    };
  } catch (error) {
    console.error("❌ Product transfer error:", error);
    throw error;
  }
};
