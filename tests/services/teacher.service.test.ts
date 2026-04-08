import { StudentRepository } from '../../src/repositories/student.repository';
import { TeacherRepository } from '../../src/repositories/teacher.repository';
import { TeacherService } from '../../src/services/teacher.service';
import { IStudent } from '../../src/types';
import { DataSource } from 'typeorm';

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
    findIdsByEmails: jest.fn(),
    findByEmail: jest.fn(),
    suspend: jest.fn(),
    getRecipientsForNotification: jest.fn()
  } as unknown as jest.Mocked<StudentRepository>;

  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {}
  };

  const dataSourceMock = {
    createQueryRunner: jest.fn(() => queryRunnerMock)
  } as unknown as DataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TeacherService(dataSourceMock, teacherRepositoryMock, studentRepositoryMock);
  });

  describe('register', () => {
    it('should register students to teacher successfully', async () => {
      const teacherEmail = 'teacher@example.com';
      const studentEmails = ['student1@example.com', 'student2@example.com'];

      teacherRepositoryMock.upsert.mockResolvedValue();
      teacherRepositoryMock.findByEmail.mockResolvedValue({
        id: 'teacher-id-1',
        email: teacherEmail
      });
      studentRepositoryMock.upsertMany.mockResolvedValue();
      studentRepositoryMock.findIdsByEmails.mockResolvedValue(['student-id-1', 'student-id-2']);
      teacherRepositoryMock.linkStudents.mockResolvedValue();

      await service.register(teacherEmail, studentEmails);

      expect(dataSourceMock.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(queryRunnerMock.connect).toHaveBeenCalledTimes(1);
      expect(queryRunnerMock.startTransaction).toHaveBeenCalledTimes(1);
      expect(teacherRepositoryMock.upsert).toHaveBeenCalledWith(teacherEmail, expect.anything());
      expect(teacherRepositoryMock.findByEmail).toHaveBeenCalledWith(
        teacherEmail,
        expect.anything()
      );
      expect(studentRepositoryMock.upsertMany).toHaveBeenCalledWith(
        studentEmails,
        expect.anything()
      );
      expect(studentRepositoryMock.findIdsByEmails).toHaveBeenCalledWith(
        studentEmails,
        expect.anything()
      );
      expect(teacherRepositoryMock.linkStudents).toHaveBeenCalledWith(
        'teacher-id-1',
        ['student-id-1', 'student-id-2'],
        expect.anything()
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });

    it('should handle duplicate student emails', async () => {
      const teacherEmail = 'teacher@example.com';
      const studentEmails = ['student1@example.com', 'student1@example.com'];

      teacherRepositoryMock.upsert.mockResolvedValue();
      teacherRepositoryMock.findByEmail.mockResolvedValue({
        id: 'teacher-id-1',
        email: teacherEmail
      });
      studentRepositoryMock.upsertMany.mockResolvedValue();
      studentRepositoryMock.findIdsByEmails.mockResolvedValue(['student-id-1']);
      teacherRepositoryMock.linkStudents.mockResolvedValue();

      await service.register(teacherEmail, studentEmails);

      expect(studentRepositoryMock.upsertMany).toHaveBeenCalledWith(
        ['student1@example.com'],
        expect.anything()
      );
      expect(studentRepositoryMock.findIdsByEmails).toHaveBeenCalledWith(
        ['student1@example.com'],
        expect.anything()
      );
      expect(teacherRepositoryMock.linkStudents).toHaveBeenCalledWith(
        'teacher-id-1',
        ['student-id-1'],
        expect.anything()
      );
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCommonStudents', () => {
    it('should get common students for single teacher', async () => {
      const expectedStudents: IStudent[] = [
        { id: 'student-id-1', email: 'student1@example.com', suspended: false },
        { id: 'student-id-2', email: 'student2@example.com', suspended: false }
      ];

      teacherRepositoryMock.getCommonStudents.mockResolvedValue(expectedStudents);

      const result = await service.getCommonStudents(['teacher@example.com']);

      expect(result).toEqual(expectedStudents);
      expect(teacherRepositoryMock.getCommonStudents).toHaveBeenCalledWith(['teacher@example.com']);
    });

    it('should get common students for multiple teachers', async () => {
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      const expectedStudents: IStudent[] = [
        { id: 'student-id-common', email: 'common@example.com', suspended: false }
      ];

      teacherRepositoryMock.getCommonStudents.mockResolvedValue(expectedStudents);

      const result = await service.getCommonStudents(teacherEmails);

      expect(result).toEqual(expectedStudents);
      expect(teacherRepositoryMock.getCommonStudents).toHaveBeenCalledWith(teacherEmails);
    });
  });

  describe('suspendStudent', () => {
    it('should suspend student successfully', async () => {
      const studentEmail = 'student@example.com';

      studentRepositoryMock.findByEmail.mockResolvedValue({
        id: 'student-id-1',
        email: studentEmail,
        suspended: false
      });
      studentRepositoryMock.suspend.mockResolvedValue();

      await service.suspendStudent(studentEmail);

      expect(studentRepositoryMock.findByEmail).toHaveBeenCalledWith(studentEmail);
      expect(studentRepositoryMock.suspend).toHaveBeenCalledWith('student-id-1');
    });

    it('should throw error when student not found', async () => {
      const studentEmail = 'nonexistent@example.com';
      studentRepositoryMock.findByEmail.mockResolvedValue(null);

      await expect(service.suspendStudent(studentEmail)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Student not found'
      });
    });
  });

  describe('getRecipientsForNotification', () => {
    it('should get notification recipients with mentions', async () => {
      const teacherEmail = 'teacher@example.com';
      const notification = 'Hello @mentioned@example.com';

      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'registered@example.com', suspended: false },
        { id: 'student-id-2', email: 'mentioned@example.com', suspended: false }
      ]);

      const result = await service.getRecipientsForNotification(teacherEmail, notification);

      expect(result).toEqual(['registered@example.com', 'mentioned@example.com']);
      expect(studentRepositoryMock.getRecipientsForNotification).toHaveBeenCalledWith(
        teacherEmail,
        ['mentioned@example.com']
      );
    });

    it('should deduplicate mentioned emails before calling repository', async () => {
      const teacherEmail = 'teacher@example.com';
      const notification = 'Hello @dup@example.com and @dup@example.com';

      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'dup@example.com', suspended: false }
      ]);

      await service.getRecipientsForNotification(teacherEmail, notification);

      expect(studentRepositoryMock.getRecipientsForNotification).toHaveBeenCalledWith(
        teacherEmail,
        ['dup@example.com']
      );
    });

    it('should deduplicate recipients from repository result', async () => {
      const teacherEmail = 'teacher@example.com';
      const notification = 'Hello @mentioned@example.com';

      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'registered@example.com', suspended: false },
        { id: 'student-id-2', email: 'mentioned@example.com', suspended: false },
        { id: 'student-id-3', email: 'registered@example.com', suspended: false }
      ]);

      const result = await service.getRecipientsForNotification(teacherEmail, notification);

      expect(result).toEqual(['registered@example.com', 'mentioned@example.com']);
    });

    it('should handle non-existent teacher with mentions', async () => {
      const teacherEmail = 'nonexistent@example.com';
      const notification = 'Hello @mentioned@example.com';

      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([
        { id: 'student-id-1', email: 'mentioned@example.com', suspended: false }
      ]);

      const result = await service.getRecipientsForNotification(teacherEmail, notification);

      expect(result).toEqual(['mentioned@example.com']);
      expect(studentRepositoryMock.getRecipientsForNotification).toHaveBeenCalledWith(
        teacherEmail,
        ['mentioned@example.com']
      );
    });

    it('should return empty array for non-existent teacher without mentions', async () => {
      const teacherEmail = 'nonexistent@example.com';
      const notification = 'Hello everyone';

      studentRepositoryMock.getRecipientsForNotification.mockResolvedValue([]);

      const result = await service.getRecipientsForNotification(teacherEmail, notification);

      expect(result).toEqual([]);
      expect(studentRepositoryMock.getRecipientsForNotification).toHaveBeenCalledWith(
        teacherEmail,
        []
      );
    });
  });
});
