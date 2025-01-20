import { MigrationInterface, QueryRunner } from "typeorm";

export class SendPackageEntity1737377057512 implements MigrationInterface {
  name = "SendPackageEntity1737377057512";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'AGENT', 'CUSTOMER', 'SUPPORT')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "phoneNumber" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying,
                "email" character varying NOT NULL,
                "street" character varying,
                "suburb" character varying,
                "state" character varying,
                "postalCode" integer,
                CONSTRAINT "UQ_user_phoneNumber" UNIQUE ("phoneNumber"),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_user_role" ON "user" ("role")
            WHERE "deletedAt" IS NULL
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
            CREATE TYPE "public"."agent_approvalstatus_enum" AS ENUM('APPROVED', 'PENDING', 'REJECTED')
        `);
    await queryRunner.query(`
            CREATE TABLE "agent" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" integer NOT NULL,
                "agentType" character varying NOT NULL,
                "abnNumber" character varying NOT NULL,
                "vehicleMake" character varying NOT NULL,
                "vehicleModel" character varying NOT NULL,
                "vehicleYear" character varying NOT NULL,
                "profilePhoto" character varying,
                "status" character varying NOT NULL DEFAULT 'OFFLINE',
                "approvalStatus" "public"."agent_approvalstatus_enum" NOT NULL DEFAULT 'PENDING',
                CONSTRAINT "UQ_agent_abnNumber" UNIQUE ("abnNumber"),
                CONSTRAINT "REL_15baaa1eb6dd8d1f0a92a17d66" UNIQUE ("userId"),
                CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_agent_status" ON "agent" ("status")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_agent_userId" ON "agent" ("userId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "drop_location" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "addressLine1" character varying(255) NOT NULL,
                "addressLine2" character varying(255),
                "landmark" character varying(255),
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                CONSTRAINT "PK_60037bc09c9ca0212413462a8bc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "order_review" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "rating" double precision NOT NULL,
                "comment" character varying,
                "customerId" integer NOT NULL,
                "sendPackageOrderId" integer NOT NULL,
                CONSTRAINT "PK_59c426f683eb876b8be2f033fd3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_sendPackageOrderId" ON "order_review" ("sendPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_customerId" ON "order_review" ("customerId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "pickup_location" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "addressLine1" character varying(255) NOT NULL,
                "addressLine2" character varying(255),
                "landmark" character varying(255),
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                CONSTRAINT "PK_dff0bb23dcd6e0dd4c88db85374" PRIMARY KEY ("id")
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
            CREATE TYPE "public"."send_package_order_status_enum" AS ENUM(
                'ACCEPTED',
                'CANCELED',
                'COMPLETED',
                'IN_PROGRESS',
                'PENDING'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."send_package_order_type_enum" AS ENUM('DELIVERY', 'PICKUP')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."send_package_order_canceledby_enum" AS ENUM('ADMIN', 'AGENT', 'CUSTOMER', 'SUPPORT')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."send_package_order_paymentstatus_enum" AS ENUM('ERROR', 'NOT_PAID', 'PAID', 'REFUNDED')
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
                "status" "public"."send_package_order_status_enum" NOT NULL DEFAULT 'PENDING',
                "type" "public"."send_package_order_type_enum" NOT NULL DEFAULT 'DELIVERY',
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
                "canceledBy" "public"."send_package_order_canceledby_enum",
                "completionPhoto" character varying,
                "acceptedAt" TIMESTAMP,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "paymentStatus" "public"."send_package_order_paymentstatus_enum" NOT NULL DEFAULT 'NOT_PAID',
                "reportId" integer,
                "orderReviewId" integer,
                CONSTRAINT "REL_bb34f77b74b39e3d9ac560f1f5" UNIQUE ("reportId"),
                CONSTRAINT "REL_d476c236d9819cfc8d248f1225" UNIQUE ("orderReviewId"),
                CONSTRAINT "PK_e648dac31c29fa7995052d2c46f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."required_document_agenttype_enum" AS ENUM('CAR_TOWING', 'DELIVERY')
        `);
    await queryRunner.query(`
            CREATE TABLE "required_document" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying NOT NULL,
                "description" character varying,
                "agentType" "public"."required_document_agenttype_enum" NOT NULL,
                "isRequired" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_300ed345f09c863bbb1b3de7f2a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "agent_review" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "rating" double precision NOT NULL,
                "comment" character varying,
                "customerId" integer NOT NULL,
                "agentId" integer NOT NULL,
                CONSTRAINT "PK_2eafa7998bac37ec79237c0adb8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_agent_review_agentId" ON "agent_review" ("agentId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_agent_review_customerId" ON "agent_review" ("customerId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "agent_document" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying NOT NULL,
                "description" character varying,
                "url" character varying NOT NULL,
                "agentId" integer NOT NULL,
                CONSTRAINT "UQ_agent_document_agentId" UNIQUE ("agentId"),
                CONSTRAINT "PK_7afc91eaadb01fb4274a78bd998" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_agent_document_agentId" ON "agent_document" ("agentId")
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
    await queryRunner.query(`
            ALTER TABLE "agent_document"
            ADD CONSTRAINT "FK_ec21940112f0cdf724e55e0df9b" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "agent_document" DROP CONSTRAINT "FK_ec21940112f0cdf724e55e0df9b"
        `);
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
            DROP INDEX "public"."IDX_agent_document_agentId"
        `);
    await queryRunner.query(`
            DROP TABLE "agent_document"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_agent_review_customerId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_agent_review_agentId"
        `);
    await queryRunner.query(`
            DROP TABLE "agent_review"
        `);
    await queryRunner.query(`
            DROP TABLE "required_document"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."required_document_agenttype_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "send_package_order"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."send_package_order_paymentstatus_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."send_package_order_canceledby_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."send_package_order_type_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."send_package_order_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_report_orderId"
        `);
    await queryRunner.query(`
            DROP TABLE "report"
        `);
    await queryRunner.query(`
            DROP TABLE "pickup_location"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_review_customerId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_review_sendPackageOrderId"
        `);
    await queryRunner.query(`
            DROP TABLE "order_review"
        `);
    await queryRunner.query(`
            DROP TABLE "drop_location"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_agent_userId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_agent_status"
        `);
    await queryRunner.query(`
            DROP TABLE "agent"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."agent_approvalstatus_enum"
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
            DROP INDEX "public"."IDX_user_role"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
  }
}
