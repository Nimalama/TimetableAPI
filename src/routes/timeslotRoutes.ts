import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import express, { Request, Response } from 'express';
import { Op } from 'sequelize';

import { validateAdminToken } from '../middleware/validation';
import { TimeSlot } from '../models/timeslot.model';

const router = express.Router();

// GET /timeslots - Get time slots for the next 7 days
router.get('/', async (req, res) => {
  try {
    // Define the start date and end date for one week from now
    const startDate = startOfDay(new Date());
    const endDate = endOfDay(addDays(startOfDay(new Date()), 7));

    // Fetch time slots for the next 7 days
    const timeSlots = await TimeSlot.findAll({
      where: {
        day: {
          [Op.between]: [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
        }
      }
    });

    return res.status(200).json({ data: timeSlots });
  } catch (error) {
    console.error('Error fetching time slots:', error);

    return res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

// POST /timeslots - Create a new time slot
router.post('/', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { day, startTime, endTime } = req.body;
    // Create a new time slot
    const timeSlot = await TimeSlot.create({ day, startTime, endTime });

    return res.status(201).json(timeSlot);
  } catch (error) {
    console.error('Error creating time slot:', error);

    return res.status(500).json({ error: 'Failed to create time slot' });
  }
});

export default router;
