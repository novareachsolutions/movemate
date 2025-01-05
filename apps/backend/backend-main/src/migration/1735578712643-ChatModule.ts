import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatModule1735578712643 implements MigrationInterface {
  name = "ChatModule1735578712643";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP CONSTRAINT "FK_792e28c0980c597f10653f3bde6"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_72bd325db8cd840513875a54942"
        `);
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
            DROP INDEX "public"."IDX_review_sendPackageOrderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
                RENAME COLUMN "sendPackageOrderId" TO "orderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP COLUMN "assignedAgentId"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD "assignedRiderId" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD "assignedSupportAgentId" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP CONSTRAINT "FK_50dc992a5df118814b247b7aa96"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ALTER COLUMN "customerId"
            SET NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("orderId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD CONSTRAINT "FK_50dc992a5df118814b247b7aa96" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD CONSTRAINT "FK_ecd070d71e8c6e22c19833e96f9" FOREIGN KEY ("assignedRiderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD CONSTRAINT "FK_c2714cfa3d6590d12e27cfa14ea" FOREIGN KEY ("assignedSupportAgentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_ca50468f2829e3b607d26c6b292" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
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
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP CONSTRAINT "FK_c2714cfa3d6590d12e27cfa14ea"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP CONSTRAINT "FK_ecd070d71e8c6e22c19833e96f9"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP CONSTRAINT "FK_50dc992a5df118814b247b7aa96"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_review_orderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ALTER COLUMN "customerId" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD CONSTRAINT "FK_50dc992a5df118814b247b7aa96" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP COLUMN "assignedSupportAgentId"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket" DROP COLUMN "assignedRiderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD "assignedAgentId" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
                RENAME COLUMN "orderId" TO "sendPackageOrderId"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_sendPackageOrderId" ON "order_review" ("sendPackageOrderId")
            WHERE ("deletedAt" IS NULL)
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_ca50468f2829e3b607d26c6b292" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_72bd325db8cd840513875a54942" FOREIGN KEY ("sendPackageOrderId") REFERENCES "send_package_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "support_ticket"
            ADD CONSTRAINT "FK_792e28c0980c597f10653f3bde6" FOREIGN KEY ("assignedAgentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
