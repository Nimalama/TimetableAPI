import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

import { ClassRoutine } from './classroutine.model';
import { User } from './user.model';

export interface CommentAttributes {
  id?: number;
  classRoutineId: string;
  studentId: string;
  comment: string;
}

export interface CommentInstance extends Model<CommentAttributes>, CommentAttributes {}

export const Comment = sequelize.define<CommentInstance>(
  'Comment',
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
    studentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true
  }
);

// Define associations
Comment.belongsTo(User, { foreignKey: 'studentId', as: 'students' });
Comment.belongsTo(ClassRoutine, { foreignKey: 'classRoutineId', as: 'classroutine' });
