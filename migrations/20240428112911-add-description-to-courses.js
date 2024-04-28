'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Courses', 'description', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
 
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Courses', 'description');
  }
};