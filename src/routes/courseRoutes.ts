import path from 'path';

import express, { Request, Response } from 'express';
import multer from 'multer';

import { validateAdminToken, validateToken } from '../middleware/validation';
import { Course } from '../models/course.model';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + String(Date.now()) + path.extname(file.originalname)); // Set filename
  }
});

// Create upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// create a new classroom
router.post('/', validateAdminToken, upload.single('coursePic'), async (req: Request, res: Response) => {
  try {
    const { name, code, credits, category, description } = req.body;

    let coursePic = '';

    // Check if file is uploaded
    if (req.file) {
      coursePic = req.file.path; // Assuming you store the path to the file in the database
    }

    // Check for missing fields
    if (!name || !code || !credits || !category || !coursePic) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new course
    const newCourse = await Course.create({ name, code, credits, category, coursePic,description });

    // Send response with course data
    res.status(201).json({ data: newCourse });
  } catch (error) {
    console.error('Error creating course: ', error);
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
router.patch('/:id', validateAdminToken, upload.single('coursePic'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, credits, category , description} = req.body;

    // Check if course exists
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.file) {
      course.coursePic = req.file.path; // Assuming you store the path to the file in the database
    }

    // Update course
    course.name = name;
    course.code = code;
    course.credits = credits;
    course.category = category;
    course.description = description;
    await course.save();

    // Send response with updated course data
    res.json({ data: course });
  } catch (error) {
    console.error('Error updating course: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
