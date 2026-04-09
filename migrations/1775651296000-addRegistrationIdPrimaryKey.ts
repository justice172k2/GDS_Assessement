import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

export class AddRegistrationIdPrimaryKey1775651296000 implements MigrationInterface {
  name = 'AddRegistrationIdPrimaryKey1775651296000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `registrations` ADD `id` varchar(36) NULL');
    const existingRows = await queryRunner.query(
      'SELECT `teacher_id`, `student_id` FROM `registrations`'
    );

    for (const row of existingRows as Array<{ teacher_id: string; student_id: string }>) {
      await queryRunner.query(
        'UPDATE `registrations` SET `id` = ? WHERE `teacher_id` = ? AND `student_id` = ?',
        [randomUUID(), row.teacher_id, row.student_id]
      );
    }

    await queryRunner.query('ALTER TABLE `registrations` MODIFY `id` varchar(36) NOT NULL');
    await queryRunner.query('ALTER TABLE `registrations` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `registrations` ADD PRIMARY KEY (`id`)');
    await queryRunner.query(
      'ALTER TABLE `registrations` ADD UNIQUE INDEX `IDX_registrations_teacher_student` (`teacher_id`, `student_id`)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `registrations` DROP INDEX `IDX_registrations_teacher_student`'
    );
    await queryRunner.query('ALTER TABLE `registrations` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `registrations` DROP COLUMN `id`');
    await queryRunner.query(
      'ALTER TABLE `registrations` ADD PRIMARY KEY (`teacher_id`, `student_id`)'
    );
  }
}
