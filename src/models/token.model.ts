import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

import { User } from './user.model';

class Token extends Model {
  public id!: number;
  public userId!: number;
  public token!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Token.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens' // Adjust table name as needed
  }
);

export default Token;
