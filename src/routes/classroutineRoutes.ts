import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import express, { Request, Response } from 'express';
import { Op } from 'sequelize';

import {
  validateAdminToken,
  validateStudentToken,
  validateTeacherToken,
  validateToken
} from '../middleware/validation';
import { Classroom } from '../models/classroom.model';
import { ClassRoutine } from '../models/classroutine.model';
import { Course } from '../models/course.model';
import { TimeSlot } from '../models/timeslot.model';
import { User } from '../models/user.model';
import { getClassRoutinesWithStudents } from '../utils/helper';

const router = express.Router();

router.get('/', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const classRoutines = await ClassRoutine.findAll({
      attributes: {
        exclude: ['classRoomId', 'courseId', 'timeSlotId', 'lecturerId']
      },
      include: [
        {
          model: Classroom,
          as: 'classroom',
          attributes: ['id', 'name']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        },
        {
          model: TimeSlot,
          as: 'timeSlot',
          attributes: ['id', 'day', 'startTime', 'endTime']
        },
        {
          model: User,
          as: 'lecturer',
          attributes: ['id', 'fullName']
        }
      ]
    });

    const classRoutinesWithStudents = await getClassRoutinesWithStudents(classRoutines);

    return res.status(200).json({ data: classRoutinesWithStudents });
  } catch (error) {
    console.error('Error fetching class routines:', error);

    return res.status(500).json({ error: 'Failed to fetch class routines' });
  }
});

router.get('/teacher', validateTeacherToken, async (req: Request, res: Response) => {
  try {
    const classRoutines = await ClassRoutine.findAll({
      attributes: {
        exclude: ['classRoomId', 'courseId', 'timeSlotId', 'lecturerId']
      },
      where: { lecturerId: req.user?.id },
      include: [
        {
          model: Classroom,
          as: 'classroom',
          attributes: ['id', 'name']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        },
        {
          model: TimeSlot,
          as: 'timeSlot',
          attributes: ['id', 'day', 'startTime', 'endTime']
        },
        {
          model: User,
          as: 'lecturer',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    const classRoutinesWithStudents = await getClassRoutinesWithStudents(classRoutines);

    return res.status(200).json({ data: classRoutinesWithStudents });
  } catch (error) {
    console.error('Error fetching class routines:', error);

    return res.status(500).json({ error: 'Failed to fetch class routines' });
  }
});

router.get('/student', validateStudentToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user ? req.user.id : 0;
    const classRoutines = await ClassRoutine.findAll({
      attributes: {
        exclude: ['classRoomId', 'courseId', 'timeSlotId', 'lecturerId']
      },
      where: {
        studentIds: {
          [Op.like]: `%${userId}%` // Check if req.user?.id is included in studentIds string
        }
      },
      include: [
        {
          model: Classroom,
          as: 'classroom',
          attributes: ['id', 'name']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code']
        },
        {
          model: TimeSlot,
          as: 'timeSlot',
          attributes: ['id', 'day', 'startTime', 'endTime']
        },
        {
          model: User,
          as: 'lecturer',
          attributes: ['id', 'fullName']
        }
      ]
    });

    const today = new Date().toISOString().split('T')[0];

    // Filter data based on timeSlot day being today or greater
    const filteredData = classRoutines.filter((item: any) => {
      const itemDate = item.timeSlot.day.split('T')[0];

      return itemDate >= today;
    });

    return res.status(200).json({ data: filteredData });
  } catch (error) {
    console.error('Error fetching class routines:', error);

    return res.status(500).json({ error: 'Failed to fetch class routines' });
  }
});

router.post('/', validateAdminToken, async (req, res) => {
  try {
    const { classRoomId, courseId, timeSlotId, lecturerId, studentIds } = req.body;

    // Ensure studentIds is an array
    const serializedStudentIds = Array.isArray(studentIds) ? studentIds.join(',') : studentIds;

    // Create the class routine
    await ClassRoutine.create({
      classRoomId,
      courseId,
      timeSlotId,
      lecturerId,
      studentIds: serializedStudentIds // Pass the serialized studentIds
    });

    return res.status(201).json({ data: true });
  } catch (error) {
    console.error('Error creating class routine:', error);

    return res.status(500).json({ error });
  }
});

router.get('/requirements', validateToken, async (req: Request, res: Response) => {
  try {
    const courses = await Course.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'code', 'credits', 'category', 'coursePic'] }
    });
    const lecturers = await User.findAll({
      where: { userType: 'teacher' },
      attributes: {
        exclude: ['email', 'password', 'userType', 'profilePic', 'address', 'department', 'createdAt', 'updatedAt']
      }
    });
    const students = await User.findAll({
      where: { userType: 'student' },
      attributes: {
        exclude: ['email', 'password', 'userType', 'profilePic', 'address', 'department', 'createdAt', 'updatedAt']
      }
    });
    const classrooms = await Classroom.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'capacity'] }
    });

    const startDate = startOfDay(new Date());
    const endDate = endOfDay(addDays(startOfDay(new Date()), 5));

    const timeSlots = await TimeSlot.findAll({
      where: {
        day: {
          [Op.between]: [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
        }
      }
    });

    return res.status(200).json({ data: { courses, lecturers, students, classrooms, timeSlots } });
  } catch (error) {
    console.error('Error fetching class routine requirements:', error);

    return res.status(500).json({ error });
  }
});

export default router;
