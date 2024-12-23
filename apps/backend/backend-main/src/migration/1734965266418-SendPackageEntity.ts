import { MigrationInterface, QueryRunner } from "typeorm";

export class SendPackageEntity1734965266418 implements MigrationInterface {
    name = 'SendPackageEntity1734965266418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_review_sendAPackageOrderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP COLUMN "sendAPackageOrderId"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_review_sendPackageOrderId" ON "order_review" ("sendPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_review_sendPackageOrderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD "sendAPackageOrderId" integer NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_review_sendAPackageOrderId" ON "order_review" ("sendAPackageOrderId")
            WHERE ("deletedAt" IS NULL)
        `);
    }

}
