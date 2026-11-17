const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

// Public routes
router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);

// Admin routes (protected)
router.get('/admin/:id', authenticateToken, categoryController.getById);
router.post('/', authenticateToken, csrfProtection, categoryController.create);
router.put('/:id', authenticateToken, csrfProtection, categoryController.update);
router.delete('/:id', authenticateToken, csrfProtection, categoryController.delete);

module.exports = router;
