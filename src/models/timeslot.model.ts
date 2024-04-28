import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../../sequelize';

export interface TimeSlotAttributes {
  id?: number;
  day: string;
  startTime: Date;
  endTime: Date;
}

export interface TimeSlotInstance extends Model<TimeSlotAttributes>, TimeSlotAttributes {}

// Define TimeSlot model
export const TimeSlot = sequelize.define<TimeSlotInstance>(
  'TimeSlot',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  },
  {
    timestamps: false
  }
);
