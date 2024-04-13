import express, { Request, Response } from 'express';

import { validateAdminToken, validateToken } from '../middleware/validation';
import { Classroom } from '../models/classroom.model';

const router = express.Router();

// create a new classroom
router.post('/', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;

    // Check for missing fields
    if (!name || !capacity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new classroom
    const newClassroom = await Classroom.create({ name, capacity });

    // Send response with classroom data
    res.status(201).json({ data: newClassroom });
  } catch (error) {
    console.error('Error creating classroom: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// fetch all classrooms
router.get('/', validateToken, async (req: Request, res: Response) => {
  try {
    const classrooms = await Classroom.findAll();

    res.json({ data: classrooms });
  } catch (error) {
    console.error('Error fetching classrooms: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// remove a classroom, only admin can do
router.delete('/:id', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if classroom exists
    const classroom = await Classroom.findByPk(id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Delete classroom
    await classroom.destroy();

    // Send response
    res.status(200).json({ data: true });
  } catch (error) {
    console.error('Error removing classroom: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// update name, capacity
router.put('/:id', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity } = req.body;

    // Check if classroom exists
    const classroom = await Classroom.findByPk(id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Update classroom
    classroom.name = name;
    classroom.capacity = capacity;

    await classroom.save();

    // Send response with updated classroom
    res.json({ data: classroom });
  } catch (error) {
    console.error('Error updating classroom: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
