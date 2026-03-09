const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const User = require('./User');
const Section = require('./Section');

const StudentSection = sequelize.define('StudentSection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  sectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Section,
      key: 'id',
    },
  },
}, {
  tableName: 'student_sections',
  timestamps: true,
});

User.belongsToMany(Section, { through: StudentSection, foreignKey: 'studentId', as: 'sections' });
Section.belongsToMany(User, { through: StudentSection, foreignKey: 'sectionId', as: 'students' });

module.exports = StudentSection;