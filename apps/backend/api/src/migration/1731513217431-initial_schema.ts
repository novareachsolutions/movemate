import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1731513217431 implements MigrationInterface {
    name = 'InitialSchema1731513217431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "required_doc" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                CONSTRAINT "PK_94f9508a4a94ff5360b807c549e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "agent_document" (
                "id" SERIAL NOT NULL,
                "url" character varying NOT NULL,
                "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "agentId" integer,
                "requiredDocId" integer,
                CONSTRAINT "UQ_1ef856e0fc96be8fd7d1961cbd6" UNIQUE ("agentId", "requiredDocId"),
                CONSTRAINT "PK_7afc91eaadb01fb4274a78bd998" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."agent_agenttype_enum" AS ENUM('CAR_TOWING', 'DELIVERY')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."agent_status_enum" AS ENUM('ONLINE', 'OFFLINE')
        `);
        await queryRunner.query(`
            CREATE TABLE "agent" (
                "id" SERIAL NOT NULL,
                "agentType" "public"."agent_agenttype_enum",
                "abnNumber" character varying NOT NULL,
                "vehicleMake" character varying NOT NULL,
                "vehicleModel" character varying NOT NULL,
                "vehicleYear" integer NOT NULL,
                "profilePhoto" character varying,
                "status" "public"."agent_status_enum" DEFAULT 'OFFLINE',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" integer,
                CONSTRAINT "REL_15baaa1eb6dd8d1f0a92a17d66" UNIQUE ("userId"),
                CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "review" (
                "id" SERIAL NOT NULL,
                "rating" integer NOT NULL,
                "comment" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "customerId" integer,
                "agentId" integer,
                "orderId" integer,
                CONSTRAINT "UQ_31db76b2d6dfe81d69e27b66c20" UNIQUE ("orderId"),
                CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "location" (
                "id" SERIAL NOT NULL,
                "addressLine1" character varying(255) NOT NULL,
                "addressLine2" character varying(255),
                "landmark" character varying(255),
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                "isSaved" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" integer,
                CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."order_status_enum" AS ENUM(
                'PENDING',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELED'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."order_type_enum" AS ENUM('DELIVERY', 'PICKUP')
        `);
        await queryRunner.query(`
            CREATE TABLE "order" (
                "id" SERIAL NOT NULL,
                "status" "public"."order_status_enum" NOT NULL DEFAULT 'PENDING',
                "type" "public"."order_type_enum" NOT NULL DEFAULT 'DELIVERY',
                "distance" integer,
                "estimatedTime" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "pickupLocationId" integer,
                "dropLocationId" integer,
                "customerId" integer,
                "agentId" integer,
                CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7a9573d6a1fb982772a9123320" ON "order" ("status")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('AGENT', 'ADMIN', 'CUSTOMER', 'SUPPORT ')
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "phoneNumber" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "street" character varying NOT NULL,
                "suburb" character varying NOT NULL,
                "state" character varying NOT NULL,
                "postalCode" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_document"
            ADD CONSTRAINT "FK_ec21940112f0cdf724e55e0df9b" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_document"
            ADD CONSTRAINT "FK_f131bcf6dbd5b4018028273e94a" FOREIGN KEY ("requiredDocId") REFERENCES "required_doc"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "agent"
            ADD CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "review"
            ADD CONSTRAINT "FK_e4d7f0ae06cc3b06f3d0af133d4" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "review"
            ADD CONSTRAINT "FK_55762186bf784ff4c0562354ed3" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "review"
            ADD CONSTRAINT "FK_31db76b2d6dfe81d69e27b66c20" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "location"
            ADD CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_a0e753044f262727b94913a7310" FOREIGN KEY ("pickupLocationId") REFERENCES "location"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_453c37fa69f198cae65c0e46c65" FOREIGN KEY ("dropLocationId") REFERENCES "location"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_124456e637cca7a415897dce659" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_6b19fc1d8b80450cdc0c5f6f7c5" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_6b19fc1d8b80450cdc0c5f6f7c5"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_124456e637cca7a415897dce659"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_453c37fa69f198cae65c0e46c65"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_a0e753044f262727b94913a7310"
        `);
        await queryRunner.query(`
            ALTER TABLE "location" DROP CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596"
        `);
        await queryRunner.query(`
            ALTER TABLE "review" DROP CONSTRAINT "FK_31db76b2d6dfe81d69e27b66c20"
        `);
        await queryRunner.query(`
            ALTER TABLE "review" DROP CONSTRAINT "FK_55762186bf784ff4c0562354ed3"
        `);
        await queryRunner.query(`
            ALTER TABLE "review" DROP CONSTRAINT "FK_e4d7f0ae06cc3b06f3d0af133d4"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent" DROP CONSTRAINT "FK_15baaa1eb6dd8d1f0a92a17d667"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_document" DROP CONSTRAINT "FK_f131bcf6dbd5b4018028273e94a"
        `);
        await queryRunner.query(`
            ALTER TABLE "agent_document" DROP CONSTRAINT "FK_ec21940112f0cdf724e55e0df9b"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7a9573d6a1fb982772a9123320"
        `);
        await queryRunner.query(`
            DROP TABLE "order"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."order_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."order_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "location"
        `);
        await queryRunner.query(`
            DROP TABLE "review"
        `);
        await queryRunner.query(`
            DROP TABLE "agent"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."agent_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."agent_agenttype_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "agent_document"
        `);
        await queryRunner.query(`
            DROP TABLE "required_doc"
        `);
    }

}
