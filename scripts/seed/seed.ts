import 'reflect-metadata';
import { dataSource } from '../../src/config/db';

type SeedStudent = {
  email: string;
  suspended: boolean;
};

type RegistrationSeed = {
  teacherEmail: string;
  studentEmail: string;
};

const teachers = [
  'teacher1@gmail.com',
  'teacher2@gmail.com',
  'teacher3@gmail.com',
  'teacher4@gmail.com'
];

const students: SeedStudent[] = [
  { email: 'student1@gmail.com', suspended: false },
  { email: 'student12@gmail.com', suspended: false },
  { email: 'student13@gmail.com', suspended: false },
  { email: 'student2@gmail.com', suspended: false },
  { email: 'student23@gmail.com', suspended: false },
  { email: 'student4@gmail.com', suspended: false }
];

const registrations: RegistrationSeed[] = [
  { teacherEmail: 'teacher1@gmail.com', studentEmail: 'student1@gmail.com' },
  { teacherEmail: 'teacher1@gmail.com', studentEmail: 'student12@gmail.com' },
  { teacherEmail: 'teacher1@gmail.com', studentEmail: 'student13@gmail.com' },
  { teacherEmail: 'teacher2@gmail.com', studentEmail: 'student2@gmail.com' },
  { teacherEmail: 'teacher2@gmail.com', studentEmail: 'student23@gmail.com' }
];

const seed = async (): Promise<void> => {
  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      for (const email of teachers) {
        await manager.query(
          'INSERT INTO teachers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = VALUES(email)',
          [email]
        );
      }

      for (const student of students) {
        await manager.query(
          'INSERT INTO students (email, suspended) VALUES (?, ?) ON DUPLICATE KEY UPDATE suspended = VALUES(suspended)',
          [student.email, student.suspended]
        );
      }

      const teacherRows = (await manager.query(
        `SELECT id, email FROM teachers WHERE email IN (${teachers.map(() => '?').join(',')})`,
        teachers
      )) as Array<{ id: string; email: string }>;

      const studentEmails = students.map((student) => student.email);
      const studentRows = (await manager.query(
        `SELECT id, email FROM students WHERE email IN (${studentEmails.map(() => '?').join(',')})`,
        studentEmails
      )) as Array<{ id: string; email: string }>;

      const teacherIdByEmail = new Map<string, string>();
      for (const row of teacherRows) {
        teacherIdByEmail.set(row.email, row.id);
      }

      const studentIdByEmail = new Map<string, string>();
      for (const row of studentRows) {
        studentIdByEmail.set(row.email, row.id);
      }

      for (const registration of registrations) {
        const teacherId = teacherIdByEmail.get(registration.teacherEmail);
        const studentId = studentIdByEmail.get(registration.studentEmail);

        if (!teacherId || !studentId) {
          throw new Error(
            `Missing teacher or student for registration: ${registration.teacherEmail} -> ${registration.studentEmail}`
          );
        }

        await manager.query(
          'INSERT INTO registrations (teacher_id, student_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)',
          [teacherId, studentId]
        );
      }
    });

    // eslint-disable-next-line no-console
    console.log('Seed data inserted successfully');
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Failed to seed data', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

void seed();
