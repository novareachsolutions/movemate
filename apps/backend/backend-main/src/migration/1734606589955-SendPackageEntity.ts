import { MigrationInterface, QueryRunner } from "typeorm";

export class SendPackageEntity1734606589955 implements MigrationInterface {
    name = 'SendPackageEntity1734606589955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "approvalStatus"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."agent_approvalstatus_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "name"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "description"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "agentType"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."required_document_agenttype_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "isRequired"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."required_document_role_enum" AS ENUM('ADMIN', 'AGENT', 'CUSTOMER', 'SUPPORT')
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "role" "public"."required_document_role_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "documents" text array NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "UQ_15baaa1eb6dd8d1f0a92a17d667"
        `);
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
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
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
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD CONSTRAINT "UQ_15baaa1eb6dd8d1f0a92a17d667" UNIQUE ("userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "documents"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "role"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."required_document_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "isRequired" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."required_document_agenttype_enum" AS ENUM('CAR_TOWING', 'DELIVERY')
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "agentType" "public"."required_document_agenttype_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "description" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "name" character varying NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."agent_approvalstatus_enum" AS ENUM('PENDING', 'REJECTED', 'APPROVED')
        `);
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "approvalStatus" "public"."agent_approvalstatus_enum" NOT NULL DEFAULT 'PENDING'
        `);
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    }

}
