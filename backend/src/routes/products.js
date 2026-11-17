const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

// Public routes (always return active products only)
router.get('/', productController.getAll);
router.get('/:slug', productController.getBySlug);

// Admin routes (protected)
router.get('/admin/:id', authenticateToken, productController.getById);
router.post('/', authenticateToken, csrfProtection, productController.create);
router.put('/:id', authenticateToken, csrfProtection, productController.update);
router.delete('/:id', authenticateToken, csrfProtection, productController.delete);

module.exports = router;
