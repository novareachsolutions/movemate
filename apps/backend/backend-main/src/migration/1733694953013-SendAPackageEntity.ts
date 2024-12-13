import { MigrationInterface, QueryRunner } from "typeorm";

export class SendAPackageEntity1733694953013 implements MigrationInterface {
  name = "SendAPackageEntity1733694953013";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_review_orderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "drop_location"
                RENAME COLUMN "orderId" TO "sendPackageOrderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "pickup_location"
                RENAME COLUMN "orderId" TO "sendPackageOrderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
                RENAME COLUMN "orderId" TO "sendPackageOrderId"
        `);
    await queryRunner.query(`
            CREATE TABLE "report" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "reason" character varying NOT NULL,
                "details" text,
                "customerId" integer NOT NULL,
                "sendPackageOrderId" integer NOT NULL,
                CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_report_orderId" ON "report" ("sendPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_report_customerId" ON "report" ("customerId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "send_package_order" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "senderName" character varying(255) NOT NULL,
                "senderPhoneNumber" character varying(20) NOT NULL,
                "receiverName" character varying(255) NOT NULL,
                "receiverPhoneNumber" character varying(20) NOT NULL,
                "packageType" character varying(255) NOT NULL,
                "deliveryInstructions" character varying(255),
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "type" character varying NOT NULL DEFAULT 'DELIVERY',
                "pickupLocationId" integer NOT NULL,
                "dropLocationId" integer NOT NULL,
                "estimatedDistance" integer NOT NULL,
                "estimatedTime" integer NOT NULL,
                "customerId" integer NOT NULL,
                "agentId" integer,
                "price" double precision,
                "actualDistance" double precision,
                "actualTime" double precision,
                "cancellationReason" text,
                "canceledBy" character varying,
                "assignedAgentId" integer,
                "completionPhoto" text,
                "acceptedAt" TIMESTAMP,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "paymentStatus" character varying NOT NULL DEFAULT 'NOT_PAID',
                "reportId" integer,
                CONSTRAINT "REL_afda8b4b580bb95cb8bc1c9f4c" UNIQUE ("pickupLocationId"),
                CONSTRAINT "REL_a4d74b69128c15c441c39e4754" UNIQUE ("dropLocationId"),
                CONSTRAINT "PK_e648dac31c29fa7995052d2c46f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("sendPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "report"
            ADD CONSTRAINT "FK_af0ab438a1e8dc4878cdc44948e" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "report"
            ADD CONSTRAINT "FK_ffc1d996c5407348ec017287c04" FOREIGN KEY ("sendPackageOrderId") REFERENCES "send_package_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_afda8b4b580bb95cb8bc1c9f4ce" FOREIGN KEY ("pickupLocationId") REFERENCES "pickup_location"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_a4d74b69128c15c441c39e47549" FOREIGN KEY ("dropLocationId") REFERENCES "drop_location"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_5e27afebe7a2237ea1e1d783c1e" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_a19489c7e015e0d61749206fc59" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_0b3addc683bd4a118fc09854d3d" FOREIGN KEY ("assignedAgentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_72bd325db8cd840513875a54942" FOREIGN KEY ("sendPackageOrderId") REFERENCES "send_package_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_72bd325db8cd840513875a54942"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_0b3addc683bd4a118fc09854d3d"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_a19489c7e015e0d61749206fc59"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_5e27afebe7a2237ea1e1d783c1e"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_a4d74b69128c15c441c39e47549"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_afda8b4b580bb95cb8bc1c9f4ce"
        `);
    await queryRunner.query(`
            ALTER TABLE "report" DROP CONSTRAINT "FK_ffc1d996c5407348ec017287c04"
        `);
    await queryRunner.query(`
            ALTER TABLE "report" DROP CONSTRAINT "FK_af0ab438a1e8dc4878cdc44948e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_review_orderId"
        `);
    await queryRunner.query(`
            DROP TABLE "send_package_order"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_report_customerId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_report_orderId"
        `);
    await queryRunner.query(`
            DROP TABLE "report"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
                RENAME COLUMN "sendPackageOrderId" TO "orderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "pickup_location"
                RENAME COLUMN "sendPackageOrderId" TO "orderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "drop_location"
                RENAME COLUMN "sendPackageOrderId" TO "orderId"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("orderId")
            WHERE ("deletedAt" IS NULL)
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
  }
}
