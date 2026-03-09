const express = require('express');
const router = express.Router();
const {
  createSection,
  getAllSections,
  assignTeacher,
  assignStudent,
  removeStudent,
  getMyStudents,
  getMySection,
} = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-students', protect, authorize('teacher'), getMyStudents);
router.get('/my-section', protect, authorize('student'), getMySection);
router.post('/', protect, authorize('admin'), createSection);
router.get('/', protect, authorize('admin'), getAllSections);
router.put('/:id/assign-teacher', protect, authorize('admin'), assignTeacher);
router.post('/:id/assign-student', protect, authorize('admin'), assignStudent);
router.delete('/:id/remove-student/:studentId', protect, authorize('admin'), removeStudent);

module.exports = router;