const express = require('express');
const router = express.Router();
const {
  createGrade,
  getGradesByStudent,
  updateGrade,
  deleteGrade,
  getGradeAnalytics,
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createGrade);
router.get('/:studentId', protect, getGradesByStudent);
router.put('/:id', protect, authorize('teacher', 'admin'), updateGrade);
router.delete('/:id', protect, authorize('admin'), deleteGrade);
router.get('/analytics/:studentId', protect, getGradeAnalytics);

module.exports = router;