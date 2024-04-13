import express, { Request, Response } from 'express';

import { validateAdminToken, validateToken } from '../middleware/validation';
import { Course } from '../models/course.model';

const router = express.Router();

// create a new classroom
router.post('/', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { name, code, credits } = req.body;

    // Check for missing fields
    if (!name || !code || !credits) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new classroom
    const newClassroom = await Course.create({ name, code, credits });

    // Send response with classroom data
    res.status(201).json({ data: newClassroom });
  } catch (error) {
    console.error('Error creating classroom: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// fetch all courses
router.get('/', validateToken, async (req: Request, res: Response) => {
  try {
    const courses = await Course.findAll();

    res.json({ data: courses });
  } catch (error) {
    console.error('Error fetching courses: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// remove a course
router.delete('/:id', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete course
    await course.destroy();

    // Send response true
    res.status(200).json({ data: true });
  } catch (error) {
    console.error('Error removing course: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// update name, credits, code
router.put('/:id', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, credits } = req.body;

    // Check if course exists
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update course
    course.name = name;
    course.code = code;
    course.credits = credits;
    await course.save();

    // Send response with updated course data
    res.json({ data: course });
  } catch (error) {
    console.error('Error updating course: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
