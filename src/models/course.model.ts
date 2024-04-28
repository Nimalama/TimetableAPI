import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

export interface CourseAttributes {
  id?: number;
  name: string;
  code: string;
  credits: number;
  coursePic?: string;
  tags?: string[];
  category: string; // Add category field
}

export interface CourseInstance extends Model<CourseAttributes>, CourseAttributes {}

export const Course = sequelize.define<CourseInstance>(
  'Course',
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    coursePic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
  },
  {
    timestamps: true
  }
);
