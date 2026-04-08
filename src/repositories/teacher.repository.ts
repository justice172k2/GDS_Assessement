import { DataSource, In } from 'typeorm';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';
import { IStudent, ITeacher } from '../types';
import { removeDuplicate, toBooleanFromDb } from '../utils/helpers';

export class TeacherRepository {
  constructor(private dataSource: DataSource) {}

  async upsert(email: string): Promise<ITeacher> {
    const repository = this.dataSource.getRepository(Teacher);
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Teacher)
      .values({ email })
      .orIgnore()
      .updateEntity(false)
      .execute();

    const teacher = await repository.findOne({ where: { email } });
    if (!teacher) {
      throw new Error(`Failed to upsert teacher with email: ${email}`);
    }

    return this.toTeacher(teacher);
  }

  async findByEmail(email: string): Promise<ITeacher | null> {
    const repository = this.dataSource.getRepository(Teacher);
    const teacher = await repository.findOne({ where: { email } });
    return teacher ? this.toTeacher(teacher) : null;
  }

  async getCommonStudents(teacherEmails: string[]): Promise<IStudent[]> {
    const uniqueTeacherEmails = removeDuplicate(teacherEmails);

    if (uniqueTeacherEmails.length === 0) {
      return [];
    }

    const teacherRows = await this.dataSource.getRepository(Teacher).find({
      select: {
        id: true
      },
      where: {
        email: In(uniqueTeacherEmails)
      }
    });

    if (teacherRows.length !== uniqueTeacherEmails.length) {
      return [];
    }

    const teacherIds = teacherRows.map((teacher) => teacher.id);

    const rows = await this.dataSource
      .createQueryBuilder()
      .select('s.id', 'id')
      .addSelect('s.email', 'email')
      .addSelect('s.suspended', 'suspended')
      .from('registrations', 'r')
      .innerJoin(Student, 's', 's.id = r.student_id')
      .where('r.teacher_id IN (:...teacherIds)', { teacherIds })
      .groupBy('s.id')
      .having('COUNT(DISTINCT r.teacher_id) = :teacherCount', { teacherCount: teacherIds.length })
      .getRawMany<{ id: string; email: string; suspended: boolean | number | string }>();

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      suspended: toBooleanFromDb(row.suspended)
    }));
  }

  async linkStudents(teacherId: string, studentIds: string[]): Promise<void> {
    if (studentIds.length === 0) {
      return;
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('registrations')
      .values(studentIds.map((studentId) => ({ teacher_id: teacherId, student_id: studentId })))
      .orIgnore()
      .updateEntity(false)
      .execute();
  }

  private toTeacher(teacher: Teacher): ITeacher {
    return {
      id: teacher.id,
      email: teacher.email
    };
  }
}
