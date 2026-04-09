import { DataSource, EntityManager } from 'typeorm';
import { Registration } from '../entities/Registration';

export class RegistrationRepository {
  constructor(private dataSource: DataSource) {}

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
      .into(Registration)
      .values(studentIds.map((studentId) => ({ teacherId, studentId })))
      .orIgnore()
      .updateEntity(false)
      .execute();
  }
}
