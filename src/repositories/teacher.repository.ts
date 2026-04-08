import { DataSource, EntityManager, In } from 'typeorm';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';
import { IStudent, ITeacher } from '../types';
import { toBooleanFromDb } from '../utils/helpers';

export class TeacherRepository {
  constructor(private dataSource: DataSource) {}

  async upsert(email: string, manager?: EntityManager): Promise<void> {
    const queryBuilder = (manager ?? this.dataSource.manager).createQueryBuilder();
    await queryBuilder
      .insert()
      .into(Teacher)
      .values({ email })
      .orIgnore()
      .updateEntity(false)
      .execute();
  }

  async findByEmail(email: string, manager?: EntityManager): Promise<ITeacher | null> {
    const repository = (manager ?? this.dataSource.manager).getRepository(Teacher);
    const teacher = await repository.findOne({ where: { email } });
    return teacher ? this.toTeacher(teacher) : null;
  }

  async getCommonStudents(teacherEmails: string[]): Promise<IStudent[]> {
    if (teacherEmails.length === 0) {
      return [];
    }

    const teacherRows = await this.dataSource.getRepository(Teacher).find({
      select: {
        id: true
      },
      where: {
        email: In(teacherEmails)
      }
    });

    if (teacherRows.length !== teacherEmails.length) {
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

  async linkStudents(
    teacherId: string,
    studentIds: string[],
    manager?: EntityManager
  ): Promise<void> {
    if (studentIds.length === 0) {
      return;
    }

    const queryBuilder = (manager ?? this.dataSource.manager).createQueryBuilder();
    await queryBuilder
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
