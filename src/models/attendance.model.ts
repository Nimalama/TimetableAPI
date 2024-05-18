import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

import { ClassRoutine } from './classroutine.model';
import { User } from './user.model';

export interface AttendanceAttributes {
  id?: number;
  classRoutineId: string;
  lecturerId: string;
  studentIds: string;
}

export interface AttendanceInstance extends Model<AttendanceAttributes>, AttendanceAttributes {}

export const Attendance = sequelize.define<AttendanceInstance>(
  'Attendance',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classRoutineId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lecturerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    studentIds: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true
  }
);

// Define associations
Attendance.belongsTo(User, { foreignKey: 'studentIds', as: 'students' });
Attendance.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
Attendance.belongsTo(ClassRoutine, { foreignKey: 'classRoutineId', as: 'classroutine' });
