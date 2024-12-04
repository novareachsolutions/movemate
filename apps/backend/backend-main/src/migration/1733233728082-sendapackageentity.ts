import { MigrationInterface, QueryRunner } from "typeorm";

export class Sendapackageentity1733233728082 implements MigrationInterface {
    name = 'Sendapackageentity1733233728082'

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
                "sendPackageOrderId" integer NOT NULL,
                CONSTRAINT "PK_60037bc09c9ca0212413462a8bc" PRIMARY KEY ("id")
            )
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
                "sendPackageOrderId" integer NOT NULL,
                CONSTRAINT "PK_dff0bb23dcd6e0dd4c88db85374" PRIMARY KEY ("id")
            )
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
                CONSTRAINT "UQ_agent_abnNumber" UNIQUE ("abnNumber"),
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
            CREATE TYPE "public"."required_document_role_enum" AS ENUM('ADMIN', 'AGENT', 'CUSTOMER', 'SUPPORT')
        `);
        await queryRunner.query(`
            CREATE TABLE "required_document" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "role" "public"."required_document_role_enum" NOT NULL,
                "documents" text array NOT NULL,
                CONSTRAINT "PK_300ed345f09c863bbb1b3de7f2a" PRIMARY KEY ("id")
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
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("sendPackageOrderId")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_review_customerId" ON "order_review" ("customerId")
            WHERE "deletedAt" IS NULL
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
            ADD CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review"
            ADD CONSTRAINT "FK_72bd325db8cd840513875a54942" FOREIGN KEY ("sendPackageOrderId") REFERENCES "send_package_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_ca50468f2829e3b607d26c6b292" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_review"
            ADD CONSTRAINT "FK_5ca3e3c3d70e553b69b009cd583" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
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
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_72bd325db8cd840513875a54942"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
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
            DROP INDEX "public"."IDX_review_customerId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_review_orderId"
        `);
        await queryRunner.query(`
            DROP TABLE "order_review"
        `);
        await queryRunner.query(`
            DROP TABLE "required_document"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."required_document_role_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "send_package_order"
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
            DROP INDEX "public"."IDX_report_customerId"
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
            DROP TABLE "drop_location"
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
