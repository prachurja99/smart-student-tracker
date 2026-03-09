const User = require('../models/User');

// @route   GET /api/admin/pending-teachers
// @access  Private - Admin only
const getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await User.findAll({
      where: { role: 'teacher', status: 'pending' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ pendingTeachers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/approve-teacher/:id
// @access  Private - Admin only
const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user || user.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await user.update({ status: 'active' });

    res.status(200).json({ message: 'Teacher approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/reject-teacher/:id
// @access  Private - Admin only
const rejectTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user || user.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await user.update({ status: 'rejected' });

    res.status(200).json({ message: 'Teacher rejected', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/admin/all-users
// @access  Private - Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route   GET /api/admin/all-students
// @access  Private - Teacher, Admin
const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student', status: 'active' },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
    });

    res.status(200).json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/admin/promote/:id
// @access  Private - Admin only
const promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    await user.update({ role: 'admin', status: 'active' });

    res.status(200).json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPendingTeachers, approveTeacher, rejectTeacher, getAllUsers, getAllStudents, promoteToAdmin };