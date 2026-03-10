const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['grade_added', 'grade_updated', 'grade_deleted'],
      default: 'grade_added',
    },
    message: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    subject: {
      type: String,
    },
    score: {
      type: Number,
    },
    maxScore: {
      type: Number,
    },
    term: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);