'use strict';

const { addDays, startOfDay, format } = require('date-fns');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define start date and end date for 24 weeks from now
    const startDate = startOfDay(new Date());
    const endDate = addDays(startOfDay(new Date()), 24 * 7 * 2); // 24 weeks

    // Define time slots for Mondays and Wednesdays only
    const timeSlots = [];

    // Iterate over each date from start date to end date
    let currentDate = startDate;
    while (currentDate <= endDate) {
      // Check if the current date is Monday or Wednesday
      if (currentDate.getDay() === 1 || currentDate.getDay() === 3) {
        // 1: Monday, 3: Wednesday
        // Add time slots for Monday
        timeSlots.push(
          {
            day: format(currentDate, 'yyyy-MM-dd'),
            startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T07:15:00Z`),
            endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T09:15:00Z`)
          },
          {
            day: format(currentDate, 'yyyy-MM-dd'),
            startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T10:15:00Z`),
            endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T12:15:00Z`)
          }
        );
      }

      // Move to the next day
      currentDate = addDays(currentDate, 1);
    }

    // Insert time slots into the database
    await queryInterface.bulkInsert(
      'TimeSlots',
      timeSlots.map((slot) => ({
        ...slot
      })),
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all time slots
    await queryInterface.bulkDelete('TimeSlots', null, {});
  }
};
