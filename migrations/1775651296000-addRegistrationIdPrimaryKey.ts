import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegistrationIdPrimaryKey1775651296000 implements MigrationInterface {
  name = 'AddRegistrationIdPrimaryKey1775651296000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `registrations` ADD `id` varchar(36) NOT NULL DEFAULT (UUID())'
    );
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
