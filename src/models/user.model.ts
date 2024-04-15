import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

export interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  fullName: string;
  userType: 'admin' | 'teacher' | 'student';
  profilePic?: string | null;
  address?: string | null;
  department?: string | null;
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
    },
    profilePic: {
      type: DataTypes.STRING, // Define profilePic field
      allowNull: true // Allow null if no profile picture provided
    },
    address: {
      type: DataTypes.STRING, // Define Address field
      allowNull: true // Allow null if no address provided
    },
    department: {
      type: DataTypes.STRING, // Define Department field
      allowNull: true // Allow null if no department provided
    }
  },
  {
    timestamps: true
  }
);
