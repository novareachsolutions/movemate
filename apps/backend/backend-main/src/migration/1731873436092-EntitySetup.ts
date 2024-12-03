import { MigrationInterface, QueryRunner } from "typeorm";

export class EntitySetup1731873436092 implements MigrationInterface {
  name = "EntitySetup1731873436092";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('AGENT', 'ADMIN', 'CUSTOMER', 'SUPPORT')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying,
                "email" character varying NOT NULL,
                "street" character varying,
                "suburb" character varying,
                "state" character varying,
                "postalCode" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
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
            CREATE TYPE "public"."required_document_role_enum" AS ENUM('AGENT', 'ADMIN', 'CUSTOMER', 'SUPPORT')
        `);
    await queryRunner.query(`
            CREATE TABLE "required_document" (
                "id" SERIAL NOT NULL,
                "role" "public"."required_document_role_enum" NOT NULL,
                "documents" text array NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_300ed345f09c863bbb1b3de7f2a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "agent" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "agentType" character varying NOT NULL,
                "abnNumber" character varying NOT NULL,
                "vehicleMake" character varying NOT NULL,
                "vehicleModel" character varying NOT NULL,
                "vehicleYear" character varying NOT NULL,
                "profilePhoto" character varying,
                "status" character varying NOT NULL DEFAULT 'OFFLINE',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
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
            CREATE TABLE "drop_location" (
                "id" SERIAL NOT NULL,
                "addressLine1" character varying(255) NOT NULL,
                "addressLine2" character varying(255),
                "landmark" character varying(255),
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                "orderId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_60037bc09c9ca0212413462a8bc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "order" (
                "id" SERIAL NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "type" character varying NOT NULL DEFAULT 'DELIVERY',
                "pickupLocationId" integer NOT NULL,
                "dropLocationId" integer NOT NULL,
                "distance" integer,
                "estimatedTime" integer,
                "customerId" integer NOT NULL,
                "agentId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_status" ON "order" ("status")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_agentId" ON "order" ("agentId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_order_customerId" ON "order" ("customerId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "pickup_location" (
                "id" SERIAL NOT NULL,
                "addressLine1" character varying(255) NOT NULL,
                "addressLine2" character varying(255),
                "landmark" character varying(255),
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                "orderId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_dff0bb23dcd6e0dd4c88db85374" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "order_review" (
                "id" SERIAL NOT NULL,
                "rating" double precision NOT NULL,
                "comment" character varying,
                "customerId" integer NOT NULL,
                "orderId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_59c426f683eb876b8be2f033fd3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_orderId" ON "order_review" ("orderId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_review_customerId" ON "order_review" ("customerId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "agent_review" (
                "id" SERIAL NOT NULL,
                "rating" double precision NOT NULL,
                "comment" character varying,
                "customerId" integer NOT NULL,
                "agentId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
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
                "name" character varying NOT NULL,
                "description" character varying,
                "url" character varying NOT NULL,
                "agentId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_agent_document_agentId" UNIQUE ("agentId"),
                CONSTRAINT "PK_7afc91eaadb01fb4274a78bd998" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_agent_document_agentId" ON "agent_document" ("agentId")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_124456e637cca7a415897dce659" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
        `);
    await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_6b19fc1d8b80450cdc0c5f6f7c5" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
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
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d2b82986ad264b7f66d2cc649b6"
        `);
    await queryRunner.query(`
            ALTER TABLE "order_review" DROP CONSTRAINT "FK_d47f4facc0a5ba3224d5aec7667"
        `);
    await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_6b19fc1d8b80450cdc0c5f6f7c5"
        `);
    await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_124456e637cca7a415897dce659"
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
            DROP TABLE "pickup_location"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_customerId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_agentId"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_order_status"
        `);
    await queryRunner.query(`
            DROP TABLE "order"
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
            DROP TABLE "required_document"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."required_document_role_enum"
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
