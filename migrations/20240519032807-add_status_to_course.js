'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Courses', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'unenrolled'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Courses', 'status');
  }
};
