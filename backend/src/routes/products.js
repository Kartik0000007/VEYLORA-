const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAll);
router.get('/:slug', productController.getBySlug);

// Admin routes (protected)
router.get('/admin/:id', authenticateToken, productController.getById);
router.post('/', authenticateToken, productController.create);
router.put('/:id', authenticateToken, productController.update);
router.delete('/:id', authenticateToken, productController.delete);

module.exports = router;
