import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToRegistrations1775651295000 implements MigrationInterface {
  name = 'AddTimestampsToRegistrations1775651295000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `registrations` ADD `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP'
    );
    await queryRunner.query(
      'ALTER TABLE `registrations` ADD `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `registrations` DROP COLUMN `updatedAt`');
    await queryRunner.query('ALTER TABLE `registrations` DROP COLUMN `createdAt`');
  }
}
