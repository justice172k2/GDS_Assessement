import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCreatedAtAndUpdatedAt1775651294391 implements MigrationInterface {
    name = 'UpdateCreatedAtAndUpdatedAt1775651294391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`students\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`createdAt\``);
    }

}
