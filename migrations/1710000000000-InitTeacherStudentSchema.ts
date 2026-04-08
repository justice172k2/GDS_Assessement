import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTeacherStudentSchema1710000000000 implements MigrationInterface {
  name = 'InitTeacherStudentSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE teachers (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) NOT NULL UNIQUE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE students (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) NOT NULL UNIQUE,
        suspended BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE registrations (
        teacher_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        PRIMARY KEY (teacher_id, student_id),
        CONSTRAINT fk_registrations_teacher
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        CONSTRAINT fk_registrations_student
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS registrations');
    await queryRunner.query('DROP TABLE IF EXISTS students');
    await queryRunner.query('DROP TABLE IF EXISTS teachers');
  }
}
