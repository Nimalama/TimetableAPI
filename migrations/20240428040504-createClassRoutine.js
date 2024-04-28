'use strict';
 
const bcrypt = require('bcrypt');
 
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Test@123', 10);
 
    // Define data for 8 teachers
    const teachersData = Array.from({ length: 8 }, (_, index) => ({
      email: `teacher${index + 1}@example.com`,
      password: hashedPassword,
      fullName: `Teacher ${index + 1}`,
      userType: 'teacher'
    }));
 
    // Define data for 30 students
    const studentsData = Array.from({ length: 30 }, (_, index) => ({
      email: `student${index + 1}@example.com`,
      password: hashedPassword,
      fullName: `Student ${index + 1}`,
      userType: 'student'
    }));
 
    const mergedData = [...teachersData, ...studentsData];
 
    // Insert teachers and students data into the database
    await queryInterface.bulkInsert(
      'Users',
      mergedData.map((data) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
  },
 
  down: async (queryInterface, Sequelize) => {
    // Remove all teachers and students
    await queryInterface.bulkDelete('Users', { where: { userType: ['teacher', 'student'] } });
  }
};