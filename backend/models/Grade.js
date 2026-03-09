const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const User = require('./User');

const Grade = sequelize.define('Grade', {
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  maxScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 100,
  },
  term: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'grades',
  timestamps: true,
});

User.hasMany(Grade, { foreignKey: 'studentId' });
Grade.belongsTo(User, { foreignKey: 'studentId' });

module.exports = Grade;