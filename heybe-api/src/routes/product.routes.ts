import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  addProduct,
  getProduct,
  updateUserProduct,
  deleteUserProduct,
  deleteAllUserProducts,
  getProductsBySiteFilter,
  getMyProducts
} from '../controllers/product.controller';

const router = Router();

// Tüm route'ları auth middleware ile koru
router.use(authenticateToken);

// Basit ürün listesi endpoint'i (en üstte tanımlanmalı)
router.get('/', getMyProducts);

// Ürün ekleme endpoint'i
router.post('/add', addProduct);

// Kullanıcının tüm ürünlerini silme endpoint'i (önce tanımlanmalı)
router.delete('/all', deleteAllUserProducts);

// Site bazında ürünleri filtreleme endpoint'i
router.get('/site/:site', getProductsBySiteFilter);

// Belirli bir ürünü getirme endpoint'i
router.get('/:id', getProduct);

// Kullanıcının ürününü güncelleme endpoint'i
router.put('/:id', updateUserProduct);

// Kullanıcının ürününü silme endpoint'i
router.delete('/:id', deleteUserProduct);

export default router;