import { MigrationInterface, QueryRunner } from "typeorm";

export class SendPackageEntity1734971118507 implements MigrationInterface {
  name = "SendPackageEntity1734971118507";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TYPE "public"."send_package_order_status_enum"
            RENAME TO "send_package_order_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."send_package_order_status_enum" AS ENUM(
                'CANCELED',
                'COMPLETED',
                'IN_PROGRESS',
                'PENDING'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ALTER COLUMN "status" TYPE "public"."send_package_order_status_enum" USING "status"::"text"::"public"."send_package_order_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ALTER COLUMN "status"
            SET DEFAULT 'PENDING'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."send_package_order_status_enum_old"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."send_package_order_status_enum_old" AS ENUM(
                'CANCELED',
                'COMPLETED',
                'IN_PROGRESS',
                'PENDING',
                'ACCEPTED'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ALTER COLUMN "status" TYPE "public"."send_package_order_status_enum_old" USING "status"::"text"::"public"."send_package_order_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ALTER COLUMN "status"
            SET DEFAULT 'PENDING'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."send_package_order_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."send_package_order_status_enum_old"
            RENAME TO "send_package_order_status_enum"
        `);
  }
}
