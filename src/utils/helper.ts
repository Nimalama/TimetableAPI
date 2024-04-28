import { User } from '../models/user.model';

export async function getClassRoutinesWithStudents(classRoutines: any): Promise<any> {
  const classRoutinesWithStudents = [];

  for (const classRoutine of classRoutines) {
    const studentIds = classRoutine.studentIds.split(',');

    const students = await User.findAll({
      where: { id: studentIds },
      attributes: ['id', 'fullName', 'email']
    });

    const classRoutineWithStudents = {
      ...classRoutine.toJSON(),
      students
    };

    classRoutinesWithStudents.push(classRoutineWithStudents);
  }

  return classRoutinesWithStudents;
}
