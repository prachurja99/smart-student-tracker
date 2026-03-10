const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAllRead, clearNotifications } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markAllRead);
router.delete('/', protect, clearNotifications);

module.exports = router;