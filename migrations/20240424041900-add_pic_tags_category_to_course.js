'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Courses', 'coursePic', {
      type: Sequelize.STRING,
      allowNull: true
    });


    await queryInterface.addColumn('Courses', 'category', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Courses', 'coursePic');
    await queryInterface.removeColumn('Courses', 'category');
  }
};
