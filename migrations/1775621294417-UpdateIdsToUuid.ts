import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIdsToUuid1775621294417 implements MigrationInterface {
    name = 'UpdateIdsToUuid1775621294417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP FOREIGN KEY \`fk_registrations_student\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP FOREIGN KEY \`fk_registrations_teacher\``);
        await queryRunner.query(`DROP INDEX \`email\` ON \`teachers\``);
        await queryRunner.query(`DROP INDEX \`email\` ON \`students\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD UNIQUE INDEX \`IDX_7568c49a630907119e4a665c60\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`students\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`students\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`students\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`students\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD UNIQUE INDEX \`IDX_25985d58c714a4a427ced57507\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`student_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP COLUMN \`teacher_id\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD \`teacher_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`student_id\`, \`teacher_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`teacher_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP COLUMN \`student_id\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD \`student_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`teacher_id\`, \`student_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_c89c2dcd0118321123cc11360c\` ON \`registrations\` (\`teacher_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a42df5f11116b3a8db20c0c639\` ON \`registrations\` (\`student_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD CONSTRAINT \`FK_c89c2dcd0118321123cc11360cb\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD CONSTRAINT \`FK_a42df5f11116b3a8db20c0c6392\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP FOREIGN KEY \`FK_a42df5f11116b3a8db20c0c6392\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP FOREIGN KEY \`FK_c89c2dcd0118321123cc11360cb\``);
        await queryRunner.query(`DROP INDEX \`IDX_a42df5f11116b3a8db20c0c639\` ON \`registrations\``);
        await queryRunner.query(`DROP INDEX \`IDX_c89c2dcd0118321123cc11360c\` ON \`registrations\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`teacher_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP COLUMN \`student_id\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD \`student_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`student_id\`, \`teacher_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`student_id\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP COLUMN \`teacher_id\``);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD \`teacher_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`registrations\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD PRIMARY KEY (\`teacher_id\`, \`student_id\`)`);
        await queryRunner.query(`ALTER TABLE \`students\` DROP INDEX \`IDX_25985d58c714a4a427ced57507\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`students\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`students\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP INDEX \`IDX_7568c49a630907119e4a665c60\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`teachers\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`email\` ON \`students\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`email\` ON \`teachers\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD CONSTRAINT \`fk_registrations_teacher\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`registrations\` ADD CONSTRAINT \`fk_registrations_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
