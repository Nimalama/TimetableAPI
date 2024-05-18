import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

import { Classroom } from './classroom.model';
import { Course } from './course.model';
import { TimeSlot } from './timeslot.model';
import { User } from './user.model';

export interface ClassRoutineAttributes {
  id?: number;
  classRoomId: string;
  courseId: string;
  timeSlotId: string;
  lecturerId: string;
  studentIds: string;
}

export interface ClassRoutineInstance extends Model<ClassRoutineAttributes>, ClassRoutineAttributes {}

export const ClassRoutine = sequelize.define<ClassRoutineInstance>(
  'ClassRoutine',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    classRoomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timeSlotId: {
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
ClassRoutine.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
ClassRoutine.belongsTo(TimeSlot, { foreignKey: 'timeSlotId', as: 'timeSlot' });
ClassRoutine.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
ClassRoutine.belongsTo(Classroom, { foreignKey: 'classRoomId', as: 'classroom' });
ClassRoutine.belongsTo(User, { foreignKey: 'studentIds', as: 'students' });

// need unique combination of classroom lecturer course users time slot, define constraints??
