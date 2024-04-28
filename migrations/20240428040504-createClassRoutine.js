'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClassRoutines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      classRoomId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      courseId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timeSlotId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lecturerId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      studentIds: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('ClassRoutines', {
      type: 'unique',
      name: 'unique_combination_constraint',
      fields: ['classRoomId', 'courseId', 'timeSlotId', 'lecturerId', 'studentIds'],
      message: 'The combination of classRoomId, courseId, timeSlotId, lecturerId, and studentIds must be unique.'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClassRoutines');
  }
};
