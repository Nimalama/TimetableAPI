import { User } from '../models/user.model';

export async function getClassRoutinesWithStudents(classRoutines: any): Promise<any> {
  const classRoutinesWithStudents = [];

  const today = new Date().toISOString().split('T')[0];

  // Filter data based on timeSlot day being today or greater
  const filteredData = classRoutines.filter((item: any) => {
    const itemDate = item.timeSlot.day.split('T')[0];

    return itemDate >= today;
  });

  // only return date >+ today for timetable
  for (const classRoutine of filteredData) {
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
