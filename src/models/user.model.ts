import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

export interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  fullName: string;
  userType: 'admin' | 'teacher' | 'student';
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {}

export const User = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      allowNull: false
    }
  },
  {
    timestamps: true
  }
);
