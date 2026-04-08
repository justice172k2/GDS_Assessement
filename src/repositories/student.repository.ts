import { DataSource, In } from 'typeorm';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';
import { IStudent } from '../types';
import { toBooleanFromDb } from '../utils/helpers';

export class StudentRepository {
  constructor(private dataSource: DataSource) {}

  async upsert(email: string): Promise<IStudent> {
    const repository = this.dataSource.getRepository(Student);
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Student)
      .values({ email })
      .orIgnore()
      .updateEntity(false)
      .execute();

    const student = await repository.findOne({ where: { email } });
    if (!student) {
      throw new Error(`Failed to upsert student with email: ${email}`);
    }

    return this.toStudent(student);
  }

  async upsertMany(emails: string[]): Promise<void> {
    if (emails.length === 0) {
      return;
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Student)
      .values(emails.map((email) => ({ email })))
      .orIgnore()
      .updateEntity(false)
      .execute();
  }

  async findIdsByEmails(emails: string[]): Promise<string[]> {
    const repository = this.dataSource.getRepository(Student);

    if (emails.length === 0) {
      return [];
    }

    const students = await repository.find({
      select: {
        id: true
      },
      where: {
        email: In(emails)
      }
    });

    return students.map((student) => student.id);
  }

  async findByEmail(email: string): Promise<IStudent | null> {
    const repository = this.dataSource.getRepository(Student);
    const student = await repository.findOne({ where: { email } });
    return student ? this.toStudent(student) : null;
  }

  async suspend(studentId: string): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(Student)
      .set({ suspended: true })
      .where('id = :studentId', { studentId })
      .execute();
  }

  async getRecipientsForNotification(
    teacherEmail: string,
    mentionedEmails: string[]
  ): Promise<IStudent[]> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('s.id', 'id')
      .addSelect('s.email', 'email')
      .addSelect('s.suspended', 'suspended')
      .from(Student, 's')
      .leftJoin('registrations', 'r', 'r.student_id = s.id')
      .leftJoin(Teacher, 't', 't.id = r.teacher_id')
      .where('s.suspended = false')
      .andWhere(
        mentionedEmails.length > 0
          ? '(t.email = :teacherEmail OR s.email IN (:...mentionedEmails))'
          : 't.email = :teacherEmail',
        {
          teacherEmail,
          mentionedEmails
        }
      )
      .groupBy('s.id');

    const rows = await qb.getRawMany<{
      id: string;
      email: string;
      suspended: boolean | number | string;
    }>();

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      suspended: toBooleanFromDb(row.suspended)
    }));
  }

  private toStudent(student: Student): IStudent {
    return {
      id: student.id,
      email: student.email,
      suspended: student.suspended
    };
  }
}
