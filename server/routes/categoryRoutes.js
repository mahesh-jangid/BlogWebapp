const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Public routes - view categories
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes - create/modify categories (admin only)
router.post('/', auth, roleCheck(['admin']), createCategory);
router.put('/:id', auth, roleCheck(['admin']), updateCategory);
router.delete('/:id', auth, roleCheck(['admin']), deleteCategory);

module.exports = router;
