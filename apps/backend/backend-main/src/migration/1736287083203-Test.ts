import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1736287083203 implements MigrationInterface {
  name = "Test1736287083203";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6"
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
            ALTER TABLE "order_review"
                RENAME COLUMN "orderId" TO "sendPackageOrderId"
        `);
    await queryRunner.query(`
            CREATE TABLE "chat_message" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "ticketId" integer NOT NULL,
                "senderId" integer NOT NULL,
                "type" character varying NOT NULL DEFAULT 'text',
                "content" text NOT NULL,
                "metadata" jsonb,
                "isRead" boolean NOT NULL DEFAULT false,
                "readAt" TIMESTAMP,
                CONSTRAINT "PK_3cc0d85193aade457d3077dd06b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "support_ticket" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "ticketNumber" character varying NOT NULL,
                "customerId" integer NOT NULL,
                "assignedRiderId" integer,
                "assignedSupportAgentId" integer,
                "status" character varying NOT NULL DEFAULT 'open',
                "priority" character varying NOT NULL DEFAULT 'medium',
                "subject" character varying,
                "category" character varying,
                "metadata" jsonb,
                "lastRepliedAt" TIMESTAMP,
                "resolvedAt" TIMESTAMP,
                "satisfactionRating" integer,
                "resolutionNotes" text,
                CONSTRAINT "UQ_35752e980cebdcfe623331dc31d" UNIQUE ("ticketNumber"),
                CONSTRAINT "PK_506b4b9f579fb3adbaebe3950c2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "ticket_note" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "ticketId" integer NOT NULL,
                "authorId" integer NOT NULL,
                "content" text NOT NULL,
                "isInternal" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_d5b5ab85fcf4daa52c8dc4420c5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "ticket_activity" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "performerId" integer NOT NULL,
                "action" character varying NOT NULL,
                "details" jsonb,
                "ticketId" integer,
                CONSTRAINT "PK_5b598792cb53ce51cb4b3cb5db1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "report" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "reason" character varying(255) NOT NULL,
                "details" character varying(255),
                "sendPackageOrderId" integer NOT NULL,
                CONSTRAINT "REL_ffc1d996c5407348ec017287c0" UNIQUE ("sendPackageOrderId"),
                CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_report_orderId" ON "report" ("sendPackageOrderId")
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
                "pickupLocationId" integer,
                "dropLocationId" integer,
                "estimatedDistance" integer,
                "estimatedTime" TIME NOT NULL,
                "customerId" integer,
                "agentId" integer,
                "price" double precision,
                "actualDistance" double precision,
                "actualTime" double precision,
                "cancellationReason" character varying,
                "canceledBy" character varying,
                "completionPhoto" character varying,
                "acceptedAt" TIMESTAMP,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "paymentStatus" character varying NOT NULL DEFAULT 'NOT_PAID',
                "reportId" integer,
                "orderReviewId" integer,
                CONSTRAINT "REL_bb34f77b74b39e3d9ac560f1f5" UNIQUE ("reportId"),
                CONSTRAINT "REL_d476c236d9819cfc8d248f1225" UNIQUE ("orderReviewId"),
                CONSTRAINT "PK_e648dac31c29fa7995052d2c46f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "drop_location" DROP COLUMN "orderId"
        `);
    await queryRunner.query(`
            ALTER TABLE "pickup_location" DROP COLUMN "orderId"
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
            ALTER TABLE "agent"
            ADD "approvalStatus" character varying NOT NULL DEFAULT 'PENDING'
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
            ALTER TABLE "required_document"
            ADD "agentType" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "isRequired" boolean NOT NULL DEFAULT true
        `);
    await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "isExpiry" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_document"
            ADD "expiry" date
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_document"
            ADD "approvalStatus" character varying NOT NULL DEFAULT 'PENDING'
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_user_role"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "role"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "role" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "agent"
            ADD CONSTRAINT "UQ_15baaa1eb6dd8d1f0a92a17d667" UNIQUE ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_user_role" ON "user" ("role")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_sendPackageOrderId" ON "order_review" ("sendPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "chat_message"
            ADD CONSTRAINT "FK_ec448aa6727a67d2dbe9cb1e5a3" FOREIGN KEY ("ticketId") REFERENCES "support_ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "chat_message"
            ADD CONSTRAINT "FK_a2be22c99b34156574f4e02d0a0" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "ticket_note"
            ADD CONSTRAINT "FK_948abb98f768ac0fe2dd7e62fab" FOREIGN KEY ("ticketId") REFERENCES "support_ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_note"
            ADD CONSTRAINT "FK_7abcf3f088527502f5647564bdc" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_activity"
            ADD CONSTRAINT "FK_7cc9884e6d4b04546686cc610b5" FOREIGN KEY ("ticketId") REFERENCES "support_ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_activity"
            ADD CONSTRAINT "FK_02a5f38ab132eebc76bc43f4584" FOREIGN KEY ("performerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_72bd325db8cd840513875a54942" FOREIGN KEY ("sendPackageOrderId") REFERENCES "send_package_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "report"
            ADD CONSTRAINT "FK_ffc1d996c5407348ec017287c04" FOREIGN KEY ("sendPackageOrderId") REFERENCES "send_package_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_afda8b4b580bb95cb8bc1c9f4ce" FOREIGN KEY ("pickupLocationId") REFERENCES "pickup_location"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_a4d74b69128c15c441c39e47549" FOREIGN KEY ("dropLocationId") REFERENCES "drop_location"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_5e27afebe7a2237ea1e1d783c1e" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_a19489c7e015e0d61749206fc59" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_bb34f77b74b39e3d9ac560f1f5d" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order"
            ADD CONSTRAINT "FK_d476c236d9819cfc8d248f12252" FOREIGN KEY ("orderReviewId") REFERENCES "order_review"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
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
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_d476c236d9819cfc8d248f12252"
        `);
    await queryRunner.query(`
            ALTER TABLE "send_package_order" DROP CONSTRAINT "FK_bb34f77b74b39e3d9ac560f1f5d"
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
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_72bd325db8cd840513875a54942"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667"
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_activity" DROP CONSTRAINT "FK_02a5f38ab132eebc76bc43f4584"
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_activity" DROP CONSTRAINT "FK_7cc9884e6d4b04546686cc610b5"
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_note" DROP CONSTRAINT "FK_7abcf3f088527502f5647564bdc"
        `);
    await queryRunner.query(`
            ALTER TABLE "ticket_note" DROP CONSTRAINT "FK_948abb98f768ac0fe2dd7e62fab"
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
            ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a2be22c99b34156574f4e02d0a0"
        `);
    await queryRunner.query(`
            ALTER TABLE "chat_message" DROP CONSTRAINT "FK_ec448aa6727a67d2dbe9cb1e5a3"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_review_sendPackageOrderId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_user_role"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "UQ_15baaa1eb6dd8d1f0a92a17d667"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "role"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('AGENT', 'ADMIN', 'CUSTOMER', 'SUPPORT')
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "role" "public"."user_role_enum" NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_user_role" ON "user" ("role")
            WHERE ("deletedAt" IS NULL)
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_document" DROP COLUMN "approvalStatus"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent_document" DROP COLUMN "expiry"
        `);
    await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "isExpiry"
        `);
    await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "isRequired"
        `);
    await queryRunner.query(`
            ALTER TABLE "required_document" DROP COLUMN "agentType"
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
            ALTER TABLE "required_document"
            ADD "documents" text array NOT NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."required_document_role_enum" AS ENUM('AGENT', 'ADMIN', 'CUSTOMER', 'SUPPORT')
        `);
    await queryRunner.query(`
            ALTER TABLE "required_document"
            ADD "role" "public"."required_document_role_enum" NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "pickup_location"
            ADD "orderId" integer NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "drop_location"
            ADD "orderId" integer NOT NULL
        `);
    await queryRunner.query(`
            DROP TABLE "send_package_order"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_report_orderId"
        `);
    await queryRunner.query(`
            DROP TABLE "report"
        `);
    await queryRunner.query(`
            DROP TABLE "ticket_activity"
        `);
    await queryRunner.query(`
            DROP TABLE "ticket_note"
        `);
    await queryRunner.query(`
            DROP TABLE "support_ticket"
        `);
    await queryRunner.query(`
            DROP TABLE "chat_message"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
                RENAME COLUMN "sendPackageOrderId" TO "orderId"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("orderId")
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
            ADD CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
  }
}
