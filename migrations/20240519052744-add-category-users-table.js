'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'category', {
      type: Sequelize.STRING,
      allowNull: false, // Allow null if no profile picture provided
      defaultValue: 'Bachelors'
    });

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'category');
  }
};
