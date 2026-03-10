const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @access  Private - Student only
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/notifications/mark-read
// @access  Private - Student only
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/notifications
// @access  Private - Student only
const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.status(200).json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getNotifications, markAllRead, clearNotifications };