const axios = require('axios');
const Grade = require('../models/Grade');
const User = require('../models/User');

// @route   POST /api/grades
// @access  Private - Teacher, Admin
const createGrade = async (req, res) => {
  try {
    const { studentId, subject, score, maxScore, term, examDate, remarks } = req.body;

    if (!studentId || !subject || !score || !term || !examDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const grade = await Grade.create({
      studentId,
      subject,
      score,
      maxScore: maxScore || 100,
      term,
      examDate,
      remarks,
    });

    res.status(201).json({ message: 'Grade created successfully', grade });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/grades/:studentId
// @access  Private - Teacher, Admin, Student (own only)
const getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Not authorized to view these grades' });
    }

    const grades = await Grade.findAll({
      where: { studentId },
      order: [['examDate', 'DESC']],
    });

    res.status(200).json({ grades });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/grades/:id
// @access  Private - Teacher, Admin
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, score, maxScore, term, examDate, remarks } = req.body;

    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.update({ subject, score, maxScore, term, examDate, remarks });

    res.status(200).json({ message: 'Grade updated successfully', grade });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/grades/:id
// @access  Private - Admin only
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.destroy();

    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/grades/analytics/:studentId
// @access  Private - Teacher, Admin, Student (own only)
const getGradeAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const grades = await Grade.findAll({ where: { studentId } });

    if (grades.length === 0) {
      return res.status(200).json({ analytics: null, message: 'No grades found' });
    }

    // Subject wise average
    const subjectMap = {};
    grades.forEach((g) => {
      if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
      subjectMap[g.subject].push((g.score / g.maxScore) * 100);
    });

    const subjectAverages = Object.keys(subjectMap).map((subject) => ({
      subject,
      average: parseFloat(
        (subjectMap[subject].reduce((a, b) => a + b, 0) / subjectMap[subject].length).toFixed(2)
      ),
    }));

    // Overall average
    const overallAverage = parseFloat(
      (
        grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length
      ).toFixed(2)
    );

    res.status(200).json({
      analytics: {
        totalGrades: grades.length,
        overallAverage,
        subjectAverages,
        grades,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/grades/ml-analysis/:studentId
// @access  Private - Teacher/Admin
const getMLAnalysis = async (req, res) => {
  try {
    const { studentId } = req.params;

    const grades = await Grade.findAll({
      where: { studentId },
      order: [['examDate', 'ASC']],
    });

    if (grades.length === 0) {
      return res.status(200).json({
        riskLevel: 'unknown',
        message: 'No grades available to analyze',
        suggestions: ['Add grades for this student to get ML analysis.'],
      });
    }

    const gradeData = grades.map((g) => ({
      subject: g.subject,
      score: parseFloat(g.score),
      maxScore: parseFloat(g.maxScore),
      examDate: g.examDate,
    }));

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001'}/analyze`, {
      grades: gradeData,
    });

    res.status(200).json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ message: 'ML service error', error: error.message });
  }
};

// @route   GET /api/grades/ml-analysis/me
// @access  Private - Student only
const getMyMLAnalysis = async (req, res) => {
  try {
    const grades = await Grade.findAll({
      where: { studentId: req.user.id },
      order: [['examDate', 'ASC']],
    });

    if (grades.length === 0) {
      return res.status(200).json({
        riskLevel: 'unknown',
        message: 'No grades available to analyze',
        suggestions: ['Your teacher has not added any grades yet.'],
      });
    }

    const gradeData = grades.map((g) => ({
      subject: g.subject,
      score: parseFloat(g.score),
      maxScore: parseFloat(g.maxScore),
      examDate: g.examDate,
    }));

    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001'}/analyze`, {
      grades: gradeData,
    });

    res.status(200).json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ message: 'ML service error', error: error.message });
  }
};

module.exports = { createGrade, getGradesByStudent, updateGrade, deleteGrade, getGradeAnalytics, getMLAnalysis, getMyMLAnalysis };