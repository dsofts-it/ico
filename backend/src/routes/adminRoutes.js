const express = require('express');
const router = express.Router();
const {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  listProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect, requireAdmin);

router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/products', listProductsAdmin);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
