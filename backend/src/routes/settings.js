const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', settingsController.getAll);
router.get('/:key', settingsController.getByKey);

// Admin routes (protected)
router.put('/:key', authenticateToken, settingsController.update);

module.exports = router;
