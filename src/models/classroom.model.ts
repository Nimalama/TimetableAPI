import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

export interface ClassroomAttributes {
  id?: number;
  name: string;
  capacity: number;
}

export interface ClassroomInstance extends Model<ClassroomAttributes>, ClassroomAttributes {}

export const Classroom = sequelize.define<ClassroomInstance>(
  'Classroom',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: true
  }
);
