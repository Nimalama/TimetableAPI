'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'profilePic', {
      type: Sequelize.STRING,
      allowNull: true // Allow null if no profile picture provided
    });
    await queryInterface.addColumn('Users', 'address', {
      type: Sequelize.STRING,
      allowNull: true // Allow null if no address provided
    });
    await queryInterface.addColumn('Users', 'department', {
      type: Sequelize.STRING,
      allowNull: true // Allow null if no department provided
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'profilePic');
    await queryInterface.removeColumn('Users', 'address');
    await queryInterface.removeColumn('Users', 'department');
  }
};
