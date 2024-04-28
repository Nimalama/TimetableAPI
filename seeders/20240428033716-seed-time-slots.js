'use strict';

const { addDays, startOfDay, format } = require('date-fns');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define start date and end date for one month from now
    const startDate = startOfDay(new Date());
    const endDate = addDays(startOfDay(new Date()), 30);

    // Define time slots for weekdays morning (7-9 and 10-12) and evening (15-17 and 18-20)
    const timeSlots = [];

    // Iterate over each date from start date to end date
    let currentDate = startDate;
    while (currentDate <= endDate) {
      // Only create time slots for weekdays (Monday to Friday)
      if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
        // Morning time slots
        timeSlots.push(
          {
            day: format(currentDate, 'yyyy-MM-dd'),
            startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T07:00:00Z`),
            endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T09:00:00Z`)
          },
          {
            day: format(currentDate, 'yyyy-MM-dd'),
            startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T10:00:00Z`),
            endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T12:00:00Z`)
          }
        );
        // Evening time slots
        timeSlots.push(
          {
            day: format(currentDate, 'yyyy-MM-dd'),
            startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T15:00:00Z`),
            endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T17:00:00Z`)
          },
          {
            day: format(currentDate, 'yyyy-MM-dd'),
            startTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T18:00:00Z`),
            endTime: new Date(`${format(currentDate, 'yyyy-MM-dd')}T20:00:00Z`)
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
        ...slot,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all time slots
    await queryInterface.bulkDelete('TimeSlots', null, {});
  }
};
