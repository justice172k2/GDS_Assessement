import { StudentRepository } from '../../src/repositories/student.repository';
import { TeacherRepository } from '../../src/repositories/teacher.repository';
import { IStudent, ITeacher } from '../../src/types';
import { TeacherService } from '../../src/services/teacher.service';

jest.mock('../../src/repositories/teacher.repository');
jest.mock('../../src/repositories/student.repository');

describe('TeacherService', () => {
  let service: TeacherService;

  const teacherRepositoryMock: jest.Mocked<TeacherRepository> = {
    upsert: jest.fn(),
    findByEmail: jest.fn(),
    getCommonStudents: jest.fn(),
    linkStudents: jest.fn()
  } as unknown as jest.Mocked<TeacherRepository>;

  const studentRepositoryMock: jest.Mocked<StudentRepository> = {
    upsert: jest.fn(),
    upsertMany: jest.fn(),
    findByEmail: jest.fn(),
    suspend: jest.fn(),
    getRecipientsForNotification: jest.fn()
  } as unknown as jest.Mocked<StudentRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TeacherService(teacherRepositoryMock, studentRepositoryMock);
  });

  describe('register', () => {
    it('upserts teacher and students, then links them', async () => {
      const teacher: ITeacher = { id: 'teacher-id-1', email: 'teacher@test.com' };
      const students: IStudent[] = [
        { id: 'student-id-10', email: 'student1@test.com', suspended: false },
        { id: 'student-id-11', email: 'student2@test.com', suspended: false }
      ];

      teacherRepositoryMock.upsert.mockResolvedValue(teacher);
      studentRepositoryMock.upsertMany.mockResolvedValue(students);

      await service.register(
        teacher.email,
        students.map((student) => student.email)
      );

      expect(teacherRepositoryMock.upsert).toHaveBeenCalledWith(teacher.email);
      expect(studentRepositoryMock.upsertMany).toHaveBeenCalledWith([
        'student1@test.com',
        'student2@test.com'
      ]);
      expect(teacherRepositoryMock.linkStudents).toHaveBeenCalledWith(teacher.id, [
        'student-id-10',
        'student-id-11'
      ]);
    });

    it('is idempotent when called twice', async () => {
      const teacher: ITeacher = { id: 'teacher-id-1', email: 'teacher@test.com' };
      const student: IStudent = {
        id: 'student-id-10',
        email: 'student@test.com',
        suspended: false
      };

      teacherRepositoryMock.upsert.mockResolvedValue(teacher);
      studentRepositoryMock.upsertMany.mockResolvedValue([student]);
      teacherRepositoryMock.linkStudents.mockResolvedValue();

      await service.register(teacher.email, [student.email]);
      await service.register(teacher.email, [student.email]);

      expect(teacherRepositoryMock.linkStudents).toHaveBeenCalledTimes(2);
      expect(teacherRepositoryMock.linkStudents).toHaveBeenNthCalledWith(1, teacher.id, [
        student.id
      ]);
      expect(teacherRepositoryMock.linkStudents).toHaveBeenNthCalledWith(2, teacher.id, [
        student.id
      ]);
    });
  });

  describe('getCommonStudents', () => {
    it('single teacher: returns all registered students', async () => {
      const students: IStudent[] = [
        { id: 'student-id-1', email: 'a@test.com', suspended: false },
        { id: 'student-id-2', email: 'b@test.com', suspended: false }
      ];
      teacherRepositoryMock.getCommonStudents.mockResolvedValue(students);

      const result = await service.getCommonStudents(['teacher@test.com']);

      expect(teacherRepositoryMock.getCommonStudents).toHaveBeenCalledWith(['teacher@test.com']);
      expect(result).toEqual(students);
    });

    it('multiple teachers: returns intersection only', async () => {
      const intersection: IStudent[] = [
        { id: 'student-id-2', email: 'b@test.com', suspended: false }
      ];
      teacherRepositoryMock.getCommonStudents.mockResolvedValue(intersection);

      const result = await service.getCommonStudents(['t1@test.com', 't2@test.com']);

      expect(teacherRepositoryMock.getCommonStudents).toHaveBeenCalledWith([
        't1@test.com',
        't2@test.com'
      ]);
      expect(result).toEqual(intersection);
    });
  });

  describe('suspendStudent', () => {
    it('suspends existing student', async () => {
      const student: IStudent = {
        id: 'student-id-22',
        email: 'student@test.com',
        suspended: false
      };
      studentRepositoryMock.findByEmail.mockResolvedValue(student);

      await service.suspendStudent(student.email);

      expect(studentRepositoryMock.findByEmail).toHaveBeenCalledWith(student.email);
      expect(studentRepositoryMock.suspend).toHaveBeenCalledWith(student.id);
    });

    it('throws AppError(404) when student not found', async () => {
      studentRepositoryMock.findByEmail.mockResolvedValue(null);

      await expect(service.suspendStudent('missing@test.com')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Student not found'
      });
    });
  });

  describe('getRecipientsForNotification', () => {
    it('returns registered + @mentioned students, deduplicated', async () => {
      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'one@test.com', suspended: false },
        { id: 'student-id-2', email: 'two@test.com', suspended: false },
        { id: 'student-id-3', email: 'one@test.com', suspended: false }
      ]);

      const result = await service.getRecipientsForNotification(
        'teacher@test.com',
        'Hello @two@test.com and @one@test.com'
      );

      expect(studentRepositoryMock.getRecipientsForNotification).toHaveBeenCalledWith(
        'teacher@test.com',
        ['two@test.com', 'one@test.com']
      );
      expect(result).toEqual(['one@test.com', 'two@test.com']);
    });

    it('excludes suspended students', async () => {
      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'active@test.com', suspended: false }
      ]);

      const result = await service.getRecipientsForNotification(
        'teacher@test.com',
        'Notice @suspended@test.com'
      );

      expect(result).toEqual(['active@test.com']);
    });

    it('handles notification with no @mentions', async () => {
      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'registered@test.com', suspended: false }
      ]);

      const result = await service.getRecipientsForNotification(
        'teacher@test.com',
        'General update'
      );

      expect(studentRepositoryMock.getRecipientsForNotification).toHaveBeenCalledWith(
        'teacher@test.com',
        []
      );
      expect(result).toEqual(['registered@test.com']);
    });
  });
});
