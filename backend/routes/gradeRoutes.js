const express = require('express');
const router = express.Router();
const {
  createGrade,
  getGradesByStudent,
  updateGrade,
  deleteGrade,
  getGradeAnalytics,
  getMLAnalysis,
  getMyMLAnalysis,
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createGrade);
router.get('/analytics/:studentId', protect, getGradeAnalytics);
router.get('/ml-analysis/me', protect, authorize('student'), getMyMLAnalysis);
router.get('/ml-analysis/:studentId', protect, authorize('teacher', 'admin'), getMLAnalysis);
router.get('/:studentId', protect, getGradesByStudent);
router.put('/:id', protect, authorize('teacher', 'admin'), updateGrade);
router.delete('/:id', protect, authorize('admin'), deleteGrade);

module.exports = router;