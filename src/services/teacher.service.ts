import { DataSource } from 'typeorm';
import { RegistrationRepository } from '../repositories/registration.repository';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { IStudent } from '../types';
import { AppError } from '../utils/errors';
import { extractMentionedEmails, removeDuplicate } from '../utils/helpers';

export class TeacherService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly teacherRepository: TeacherRepository,
    private readonly studentRepository: StudentRepository,
    private readonly registrationRepository: RegistrationRepository
  ) {}

  async register(teacherEmail: string, studentEmails: string[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      await this.teacherRepository.upsert(teacherEmail, manager);
      const uniqueStudentEmails = removeDuplicate(studentEmails);
      await this.studentRepository.upsertMany(uniqueStudentEmails, manager);
      const teacher = await this.teacherRepository.findByEmail(teacherEmail, manager);
      if (!teacher) return;
      const studentIds = await this.studentRepository.findIdsByEmails(uniqueStudentEmails, manager);
      await this.registrationRepository.linkStudents(teacher.id, studentIds, manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCommonStudents(teacherEmails: string[]): Promise<IStudent[]> {
    const uniqueTeacherEmails = removeDuplicate(teacherEmails);
    return this.teacherRepository.getCommonStudents(uniqueTeacherEmails);
  }

  async suspendStudent(studentEmail: string): Promise<void> {
    const student = await this.studentRepository.findByEmail(studentEmail);

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    await this.studentRepository.suspend(student.id);
  }

  async getRecipientsForNotification(
    teacherEmail: string,
    notification: string
  ): Promise<string[]> {
    const mentions = removeDuplicate(extractMentionedEmails(notification));
    const teacher = await this.teacherRepository.findByEmail(teacherEmail);

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    const recipients = await this.studentRepository.getRecipientsForNotification(
      teacherEmail,
      mentions
    );

    return removeDuplicate(recipients.map((recipient) => recipient.email));
  }
}
