import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import express, { Request, Response } from 'express';
import { Op, UniqueConstraintError } from 'sequelize';

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
    const { classRoomId, courseId, timeSlotId, lecturerId, studentIds, singleSlot } = req.body;

    console.log(req.body);

    // Ensure studentIds is an array
    const serializedStudentIds = Array.isArray(studentIds) ? studentIds.join(',') : studentIds;

    if (singleSlot) {
      // Create the class routine
      await ClassRoutine.create({
        classRoomId,
        courseId,
        timeSlotId,
        lecturerId,
        studentIds: serializedStudentIds // Pass the serialized studentIds
      });

      return res.status(201).json({ data: true });
    }

    if (!singleSlot) {
      // populate the class routine for the next 12 weeks
      const startDate = startOfDay(new Date());
      const endDate = endOfDay(addDays(startOfDay(new Date()), 12 * 7)); // 16 weeks

      // Query for time slots
      const timeSlots = await TimeSlot.findAll({
        where: {
          day: {
            [Op.between]: [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
          },
          startTime: {
            [Op.or]: [
              { [Op.between]: [new Date('1970-01-01T07:15:00Z'), new Date('1970-01-01T09:15:00Z')] },
              { [Op.between]: [new Date('1970-01-01T10:15:00Z'), new Date('1970-01-01T12:15:00Z')] }
            ]
          }
        }
      });

      // Create the class routine for
      for (const slot of timeSlots) {
        await ClassRoutine.create({
          classRoomId,
          courseId,
          timeSlotId: slot.id ? slot.id.toString() : '',
          lecturerId,
          studentIds: serializedStudentIds // Pass the serialized studentIds
        });
      }

      return res.status(201).json({ data: true });
    }
  } catch (err) {
    console.error('Error updating class routine:', err);

    if (err instanceof UniqueConstraintError) {
      // Handle unique constraint errors based on the constraint name
      if (err.errors) {
        for (const e of err.errors) {
          if (e.path === 'unique_combination_classroom_course_timeslot') {
            return res.status(400).json('The combination of classroom, course, and timeslot must be unique.');
          } else if (e.path === 'unique_combination_lecturer_timeslot') {
            return res.status(400).json('The combination of lecturer and timeslot must be unique.');
          } else if (e.path === 'unique_combination_studentids_timeslot') {
            return res.status(400).json('The combination of students and timeslot must be unique.');
          } else if (e.path === 'unique_combination_classroom_timeslot') {
            return res.status(400).json('The combination of classroom and timeslot must be unique.');
          }
        }
      }
    }

    return res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
});

// update fields
router.patch('/:id', validateAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { classRoomId, courseId, timeSlotId, lecturerId, studentIds } = req.body;

    // Ensure studentIds is an array
    const serializedStudentIds = Array.isArray(studentIds) ? studentIds.join(',') : studentIds;

    // Find the class routine
    const classRoutine = await ClassRoutine.findByPk(id);

    if (!classRoutine) {
      return res.status(404).json({ message: 'Class routine not found' });
    }

    // Update the class routine
    await classRoutine.update({
      classRoomId,
      courseId,
      timeSlotId,
      lecturerId,
      studentIds: serializedStudentIds // Pass the serialized studentIds
    });

    return res.status(200).json({ data: true });
  } catch (err) {
    console.error('Error updating class routine:', err);

    if (err instanceof UniqueConstraintError) {
      // Handle unique constraint errors based on the constraint name
      if (err.errors) {
        for (const e of err.errors) {
          if (e.path === 'unique_combination_classroom_course_timeslot') {
            return res.status(400).json('The combination of classroom, course, and timeslot must be unique.');
          } else if (e.path === 'unique_combination_lecturer_timeslot') {
            return res.status(400).json('The combination of lecturer and timeslot must be unique.');
          } else if (e.path === 'unique_combination_studentids_timeslot') {
            return res.status(400).json('The combination of students and timeslot must be unique.');
          } else if (e.path === 'unique_combination_classroom_timeslot') {
            return res.status(400).json('The combination of classroom and timeslot must be unique.');
          }
        }
      }
    }

    return res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
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
    const endDate = addDays(startOfDay(new Date()), 12 * 7); // 16 weeks

    // Query for time slots
    const timeSlots = await TimeSlot.findAll({
      where: {
        day: {
          [Op.between]: [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
        },
        startTime: {
          [Op.or]: [
            { [Op.between]: [new Date('1970-01-01T07:15:00Z'), new Date('1970-01-01T09:15:00Z')] },
            { [Op.between]: [new Date('1970-01-01T10:15:00Z'), new Date('1970-01-01T12:15:00Z')] }
          ]
        }
      }
    });

    return res.status(200).json({ data: { courses, lecturers, students, classrooms, timeSlots } });
  } catch (err) {
    const error = err as Error;

    console.error('Error fetching class routine requirements:', error);

    return res.status(500).json({ error });
  }
});

export default router;
