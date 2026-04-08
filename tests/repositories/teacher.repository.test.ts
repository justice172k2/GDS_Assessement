import { DataSource } from 'typeorm';
import { TeacherRepository } from '../../src/repositories/teacher.repository';

const createCommonStudentsQueryBuilderMock = (
  rows: Array<{ id: string; email: string; suspended: boolean | number | string }>
) => {
  const qb = {
    select: jest.fn(),
    addSelect: jest.fn(),
    from: jest.fn(),
    innerJoin: jest.fn(),
    where: jest.fn(),
    groupBy: jest.fn(),
    having: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows)
  };

  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.from.mockReturnValue(qb);
  qb.innerJoin.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.groupBy.mockReturnValue(qb);
  qb.having.mockReturnValue(qb);

  return qb;
};

describe('TeacherRepository', () => {
  it('returns [] immediately when teacherEmails is empty', async () => {
    const dataSourceMock = {
      getRepository: jest.fn(),
      createQueryBuilder: jest.fn()
    } as unknown as DataSource;
    const repository = new TeacherRepository(dataSourceMock);

    const result = await repository.getCommonStudents([]);

    expect(result).toEqual([]);
    expect(dataSourceMock.getRepository).not.toHaveBeenCalled();
    expect(dataSourceMock.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('returns [] when at least one teacher email does not exist', async () => {
    const teacherRepositoryMock = {
      find: jest.fn().mockResolvedValue([{ id: 'teacher-id-1' }])
    };
    const dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(teacherRepositoryMock),
      createQueryBuilder: jest.fn()
    } as unknown as DataSource;
    const repository = new TeacherRepository(dataSourceMock);

    const result = await repository.getCommonStudents(['t1@test.com', 't2@test.com']);

    expect(result).toEqual([]);
    expect(dataSourceMock.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('uses registrations table directly and maps DB booleans correctly', async () => {
    const qb = createCommonStudentsQueryBuilderMock([
      { id: 'student-id-1', email: 'student1@test.com', suspended: 0 },
      { id: 'student-id-2', email: 'student2@test.com', suspended: '1' }
    ]);
    const teacherRepositoryMock = {
      find: jest.fn().mockResolvedValue([{ id: 'teacher-id-1' }, { id: 'teacher-id-2' }])
    };
    const dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(teacherRepositoryMock),
      createQueryBuilder: jest.fn().mockReturnValue(qb)
    } as unknown as DataSource;
    const repository = new TeacherRepository(dataSourceMock);

    const result = await repository.getCommonStudents([
      't1@test.com',
      't1@test.com',
      't2@test.com'
    ]);

    expect(qb.from).toHaveBeenCalledWith('registrations', 'r');
    expect(qb.where).toHaveBeenCalledWith('r.teacher_id IN (:...teacherIds)', {
      teacherIds: ['teacher-id-1', 'teacher-id-2']
    });
    expect(qb.having).toHaveBeenCalledWith('COUNT(DISTINCT r.teacher_id) = :teacherCount', {
      teacherCount: 2
    });
    expect(result).toEqual([
      { id: 'student-id-1', email: 'student1@test.com', suspended: false },
      { id: 'student-id-2', email: 'student2@test.com', suspended: true }
    ]);
  });
});
