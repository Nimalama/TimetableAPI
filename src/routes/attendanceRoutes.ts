import express, { Request, Response } from 'express';
import { Op } from 'sequelize'; // Import the Op symbol from the sequelize package

import { validateAdminToken, validateStudentToken, validateTeacherToken } from '../middleware/validation';
import { Attendance } from '../models/attendance.model';
import { ClassRoutine } from '../models/classroutine.model';
import { Course } from '../models/course.model';
import { User } from '../models/user.model';

const router = express.Router();

interface CourseInterface {
  id: number;
  name: string;
  // Add other fields if needed
}

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

    // Get all class routines where the student is enrolled
    const classroutines = await ClassRoutine.findAll({
      where: {
        studentIds: {
          [Op.substring]: id
        }
      }
    });

    const allClassRoutineIds = classroutines.map((classroutine) => classroutine.id) as number[];

    // Get all attendances for these class routines
    const allAttendance = await Attendance.findAll({
      where: {
        classRoutineId: {
          [Op.in]: allClassRoutineIds
        }
      }
    });

    // Get the unique course IDs
    const courseIds = [...new Set(classroutines.map((classroutine) => classroutine.courseId))] as string[];

    // Get all courses by these IDs
    const courses = (await Course.findAll({
      where: {
        id: {
          [Op.in]: courseIds
        }
      }
    })) as CourseInterface[];

    // Create a lookup for courses by ID
    const courseLookup: { [key: number]: CourseInterface } = courses.reduce<{ [key: number]: CourseInterface }>(
      (acc, course: CourseInterface) => {
        acc[+course.id] = course;

        return acc;
      },
      {}
    );

    // Calculate the total classes and attendance counts
    const courseStats = courseIds
      .map((courseId) => {
        const courseClassRoutines = classroutines.filter(
          (cr) => cr.courseId === courseId && allAttendance.some((att) => +att.classRoutineId === cr?.id)
        );
        const totalClasses = courseClassRoutines.length;
        const attendedClasses = courseClassRoutines.filter((cr) =>
          allAttendance.some((att) => +att.classRoutineId === cr?.id && att.studentIds.includes(id))
        ).length;
        const absentClasses = totalClasses - attendedClasses;

        return {
          courseName: courseLookup[+courseId].name,
          totalClassesCompleted: totalClasses,
          totalClassesAttended: attendedClasses,
          totalAbsentCount: absentClasses
        };
      })
      .filter((courseStat) => courseStat.totalClassesCompleted > 0);

    res.status(200).json({ data: courseStats });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get total classes and attended classes  number of a teacher
router.get('/teacher', validateTeacherToken, async (req: Request, res: Response) => {
  try {
    const id = req.user?.id ?? '';

    // Get all class routines where the teacher is the lecturer
    const classroutines = await ClassRoutine.findAll({
      where: {
        lecturerId: id
      }
    });

    const allClassRoutineIds = classroutines.map((classroutine) => classroutine.id) as number[];

    // Get all attendances for these class routines
    const allAttendance = await Attendance.findAll({
      where: {
        classRoutineId: {
          [Op.in]: allClassRoutineIds
        }
      }
    });

    // Get the unique course IDs
    const courseIds = [...new Set(classroutines.map((classroutine) => classroutine.courseId))] as string[];

    // Get all courses by these IDs
    const courses = (await Course.findAll({
      where: {
        id: {
          [Op.in]: courseIds
        }
      }
    })) as CourseInterface[];

    // Create a lookup for courses by ID
    const courseLookup: { [key: number]: CourseInterface } = courses.reduce<{ [key: number]: CourseInterface }>(
      (acc, course: CourseInterface) => {
        acc[+course.id] = course;

        return acc;
      },
      {}
    );

    // Calculate the total classes and attendance counts
    const courseStats = courseIds
      .map((courseId) => {
        const courseClassRoutines = classroutines.filter(
          (cr) => cr.courseId === courseId && allAttendance.some((att) => +att.classRoutineId === cr?.id)
        );
        const totalClasses = courseClassRoutines.length;
        const attendedClasses = courseClassRoutines.filter((cr) =>
          allAttendance.some((att) => +att.classRoutineId === cr?.id)
        ).length;
        const absentClasses = totalClasses - attendedClasses;

        return {
          courseName: courseLookup[+courseId].name,
          totalClassesCompleted: totalClasses,
          totalClassesAttended: attendedClasses,
          totalAbsentCount: absentClasses
        };
      })
      .filter((courseStat) => courseStat.totalClassesCompleted > 0); // Filter out courses with less than 1 total class

    res.status(200).json({ data: courseStats });
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
