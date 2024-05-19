'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique constraint for the first combination
    await queryInterface.addConstraint('ClassRoutines', {
      type: 'unique',
      name: 'unique_combination_classroom_course_timeslot',
      fields: ['classRoomId', 'courseId', 'timeSlotId'],
      message: 'The combination of classRoomId, courseId, and timeSlotId must be unique.'
    });

    // Add unique constraint for the second combination
    await queryInterface.addConstraint('ClassRoutines', {
      type: 'unique',
      name: 'unique_combination_lecturer_timeslot',
      fields: ['lecturerId', 'timeSlotId'],
      message: 'The combination of lecturerId and timeSlotId must be unique.'
    });

    // Add unique constraint for the third combination
    await queryInterface.addConstraint('ClassRoutines', {
      type: 'unique',
      name: 'unique_combination_studentids_timeslot',
      fields: ['studentIds', 'timeSlotId'],
      message: 'The combination of studentIds and timeSlotId must be unique.'
    });

    // Add unique constraint for the fourth combination
    await queryInterface.addConstraint('ClassRoutines', {
      type: 'unique',
      name: 'unique_combination_classroom_timeslot',
      fields: ['classRoomId', 'timeSlotId'],
      message: 'The combination of classRoomId and timeSlotId must be unique.'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the unique constraints
    await queryInterface.removeConstraint('ClassRoutines', 'unique_combination_classroom_course_timeslot');
    await queryInterface.removeConstraint('ClassRoutines', 'unique_combination_lecturer_timeslot');
    await queryInterface.removeConstraint('ClassRoutines', 'unique_combination_studentids_timeslot');
    await queryInterface.removeConstraint('ClassRoutines', 'unique_combination_classroom_timeslot');
  }
};
