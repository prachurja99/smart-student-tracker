const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const User = require('./User');

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'sections',
  timestamps: true,
});

User.hasMany(Section, { foreignKey: 'teacherId', as: 'teachingSections' });
Section.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

module.exports = Section;