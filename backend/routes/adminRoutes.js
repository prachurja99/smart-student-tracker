const express = require('express');
const router = express.Router();
const {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher,
  getAllUsers,
  getAllStudents,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/pending-teachers', protect, authorize('admin'), getPendingTeachers);
router.put('/approve-teacher/:id', protect, authorize('admin'), approveTeacher);
router.put('/reject-teacher/:id', protect, authorize('admin'), rejectTeacher);
router.get('/all-users', protect, authorize('admin'), getAllUsers);
router.get('/all-students', protect, authorize('teacher', 'admin'), getAllStudents);

module.exports = router;