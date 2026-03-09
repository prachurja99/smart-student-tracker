const Section = require('../models/Section');
const User = require('../models/User');
const StudentSection = require('../models/StudentSection');

// @route   POST /api/sections
// @access  Private - Admin only
const createSection = async (req, res) => {
  try {
    const { name, teacherId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    const section = await Section.create({ name, teacherId: teacherId || null });

    res.status(201).json({ message: 'Section created successfully', section });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Section name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/sections
// @access  Private - Admin only
const getAllSections = async (req, res) => {
  try {
    const sections = await Section.findAll({
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'students',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ sections });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/sections/:id/assign-teacher
// @access  Private - Admin only
const assignTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    const section = await Section.findByPk(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const teacher = await User.findByPk(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await section.update({ teacherId });

    res.status(200).json({ message: 'Teacher assigned successfully', section });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/sections/:id/assign-student
// @access  Private - Admin only
const assignStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const section = await Section.findByPk(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existing = await StudentSection.findOne({ where: { studentId, sectionId: id } });
    if (existing) {
      return res.status(400).json({ message: 'Student already assigned to this section' });
    }

    await StudentSection.create({ studentId, sectionId: id });

    res.status(201).json({ message: 'Student assigned to section successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/sections/:id/remove-student/:studentId
// @access  Private - Admin only
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    await StudentSection.destroy({ where: { sectionId: id, studentId } });

    res.status(200).json({ message: 'Student removed from section successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/sections/my-students
// @access  Private - Teacher only
const getMyStudents = async (req, res) => {
  try {
    const section = await Section.findOne({
      where: { teacherId: req.user.id },
      include: [
        {
          model: User,
          as: 'students',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
    });

    if (!section) {
      return res.status(200).json({ students: [], section: null });
    }

    res.status(200).json({ students: section.students, section });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/sections/my-section
// @access  Private - Student only
const getMySection = async (req, res) => {
  try {
    const studentSection = await StudentSection.findOne({
      where: { studentId: req.user.id },
    });

    if (!studentSection) {
      return res.status(200).json({ section: null });
    }

    const section = await Section.findByPk(studentSection.sectionId, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json({ section });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSection, getAllSections, assignTeacher, assignStudent, removeStudent, getMyStudents, getMySection };