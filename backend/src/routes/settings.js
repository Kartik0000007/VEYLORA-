const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

// Public routes
router.get('/', settingsController.getAll);
router.get('/:key', settingsController.getByKey);

// Admin routes (protected)
router.put('/:key', authenticateToken, csrfProtection, settingsController.update);

module.exports = router;
