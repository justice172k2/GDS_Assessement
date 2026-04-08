import { DataSource } from 'typeorm';
import { StudentRepository } from '../../src/repositories/student.repository';

const createRecipientsQueryBuilderMock = (
  rows: Array<{ id: string; email: string; suspended: boolean | number | string }>
) => {
  const qb = {
    select: jest.fn(),
    addSelect: jest.fn(),
    from: jest.fn(),
    leftJoin: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows)
  };

  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.from.mockReturnValue(qb);
  qb.leftJoin.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.groupBy.mockReturnValue(qb);

  return qb;
};

describe('StudentRepository', () => {
  it('builds notification query with deduplicated mentioned emails', async () => {
    const qb = createRecipientsQueryBuilderMock([
      { id: 'student-id-1', email: 'active@test.com', suspended: 0 },
      { id: 'student-id-2', email: 'mentioned@test.com', suspended: '1' }
    ]);
    const dataSourceMock = {
      createQueryBuilder: jest.fn().mockReturnValue(qb)
    } as unknown as DataSource;
    const repository = new StudentRepository(dataSourceMock);

    const result = await repository.getRecipientsForNotification('teacher@test.com', [
      'mentioned@test.com',
      'mentioned@test.com'
    ]);

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(t.email = :teacherEmail OR s.email IN (:...mentionedEmails))',
      {
        teacherEmail: 'teacher@test.com',
        mentionedEmails: ['mentioned@test.com']
      }
    );
    expect(result).toEqual([
      { id: 'student-id-1', email: 'active@test.com', suspended: false },
      { id: 'student-id-2', email: 'mentioned@test.com', suspended: true }
    ]);
  });

  it('builds notification query without IN clause when no mentions', async () => {
    const qb = createRecipientsQueryBuilderMock([]);
    const dataSourceMock = {
      createQueryBuilder: jest.fn().mockReturnValue(qb)
    } as unknown as DataSource;
    const repository = new StudentRepository(dataSourceMock);

    await repository.getRecipientsForNotification('teacher@test.com', []);

    expect(qb.andWhere).toHaveBeenCalledWith('t.email = :teacherEmail', {
      teacherEmail: 'teacher@test.com',
      mentionedEmails: []
    });
  });
});
