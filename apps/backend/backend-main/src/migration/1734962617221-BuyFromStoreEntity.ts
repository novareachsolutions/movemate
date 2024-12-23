import { MigrationInterface, QueryRunner } from "typeorm";

export class BuyFromStoreEntity1734962617221 implements MigrationInterface {
    name = 'BuyFromStoreEntity1734962617221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review" DROP CONSTRAINT "FK_ca50468f2829e3b607d26c6b292"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review" DROP CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_review_orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "role"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."required_document_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "documents"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD "sendAPackageOrderId" integer NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."agent_approvalstatus_enum" AS ENUM('PENDING', 'REJECTED', 'APPROVED')
        `);
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "approvalStatus" "public"."agent_approvalstatus_enum" NOT NULL DEFAULT 'PENDING'
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "name" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "description" character varying
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
            ADD "isRequired" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD CONSTRAINT "UQ_15baaa1eb6dd8d1f0a92a17d667" UNIQUE ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_review_sendAPackageOrderId" ON "order_review" ("sendAPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_ca50468f2829e3b607d26c6b292" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "agent_review" DROP CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review" DROP CONSTRAINT "FK_ca50468f2829e3b607d26c6b292"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_review_sendAPackageOrderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "UQ_15baaa1eb6dd8d1f0a92a17d667"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "isRequired"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "agentType"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."required_document_agenttype_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "description"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "name"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "approvalStatus"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."agent_approvalstatus_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP COLUMN "sendAPackageOrderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "documents" text array NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."required_document_role_enum" AS ENUM('ADMIN', 'AGENT', 'CUSTOMER', 'SUPPORT')
        `);
        await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "role" "public"."required_document_role_enum" NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("sendPackageOrderId")
            WHERE ("deletedAt" IS NULL)
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_ca50468f2829e3b607d26c6b292" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    }

}
