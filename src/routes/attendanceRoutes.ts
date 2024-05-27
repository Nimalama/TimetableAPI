import express, { Request, Response } from 'express';
import { Op } from 'sequelize';

import { validateAdminToken, validateStudentToken, validateTeacherToken } from '../middleware/validation';
import { Attendance } from '../models/attendance.model';
import { ClassRoutine } from '../models/classroutine.model';
import { User } from '../models/user.model';

const router = express.Router();

router.post('/', validateTeacherToken, async (req: Request, res: Response) => {
  try {
    const { classRoutineId, studentIds } = req.body; // Assuming classRoutineId and studentIds are sent in the request body

    // Perform validation if needed
    const serializedStudentIds = Array.isArray(studentIds) ? studentIds.join(',') : studentIds;

    // Create attendance record
    await Attendance.create({
      classRoutineId,
      studentIds: serializedStudentIds,
      lecturerId: req.user?.id ?? '' // Assuming studentIds is an array
    });

    // Send response
    res.status(201).json({ data: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get total classes and attended classes  number of a student
router.get('/student', validateStudentToken, async (req: Request, res: Response) => {
  try {
    const id = req.user?.id ?? '';

    // Get count for attended classes from studentIds includes in attendance table
    const totalAttendedClasses = await Attendance.count({
      where: {
        studentIds: {
          [Op.substring]: id // Look for the student id within the studentIds field
        }
      }
    });

    // Get total classes from classroutine table
    const totalClasses = await ClassRoutine.count({
      where: {
        studentIds: {
          [Op.substring]: id // Look for the student id within the studentIds field
        }
      }
    });

    res.status(200).json({ data: { totalAttendedClasses, totalClasses } });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get total classes and attended classes  number of a teacher
router.get('/teacher', validateTeacherToken, async (req: Request, res: Response) => {
  try {
    const id = req.user?.id ?? '';

    // Get count for attended classes from studentIds includes in attendance table
    const totalAttendedClasses = await Attendance.count({
      where: {
        lecturerId: id // Look for the teacher id within the lecturerId field
      }
    });

    // Get total classes from classroutine table
    const totalClasses = await ClassRoutine.count({
      where: {
        lecturerId: id // Look for the teacher id within the lecturerId field
      }
    });

    res.status(200).json({ data: { totalAttendedClasses, totalClasses } });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get all attendance records per teachers and students with their total attended classes and total classes only if total classes count is greater than 0
router.get('/all', validateAdminToken, async (req: Request, res: Response) => {
  try {
    // Fetch all attendance records
    const attendanceRecords = await Attendance.findAll();

    // Initialize arrays for lecturers and students data
    const lecturersData = [];
    const studentsData = [];

    // Fetch names from User table for each lecturer and student
    const lecturerIds = [...new Set(attendanceRecords.map((record) => record.lecturerId))];

    const lecturers = await User.findAll({
      where: {
        id: {
          [Op.in]: lecturerIds
        }
      }
    });

    for (const lecturer of lecturers) {
      const totalAttendedClasses = await Attendance.count({
        where: {
          lecturerId: lecturer.id // Look for the teacher id within the lecturerId field
        }
      });

      // Get total classes from classroutine table
      const totalClasses = await ClassRoutine.count({
        where: {
          lecturerId: lecturer.id // Look for the teacher id within the lecturerId field
        }
      });

      if (totalClasses > 0) {
        lecturersData.push({
          name: lecturer.fullName,
          totalClasses,
          totalAttendedClasses
        });
      }
    }

    const studentIds = [...new Set(attendanceRecords.map((record) => record.studentIds.split(',')).flat())];
    const students = await User.findAll({
      where: {
        id: {
          [Op.in]: studentIds
        }
      }
    });

    for (const student of students) {
      // Get count for attended classes from studentIds includes in attendance table
      const totalAttendedClasses = await Attendance.count({
        where: {
          studentIds: {
            [Op.substring]: student.id // Look for the student id within the studentIds field
          }
        }
      });

      // Get total classes from classroutine table
      const totalClasses = await ClassRoutine.count({
        where: {
          studentIds: {
            [Op.substring]: student.id // Look for the student id within the studentIds field
          }
        }
      });

      if (totalClasses > 0) {
        studentsData.push({
          name: student.fullName,
          totalClasses,
          totalAttendedClasses
        });
      }
    }

    return res.status(200).json({ data: { lecturersData, studentsData } });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
