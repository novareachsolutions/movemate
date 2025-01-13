import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentSetup1736115389869 implements MigrationInterface {
  name = "PaymentSetup1736115389869";

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            ALTER TABLE "agent"
            ALTER COLUMN "commissionRate"
            SET DEFAULT '0.1'
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
            ALTER TABLE "agent"
            ALTER COLUMN "commissionRate"
            SET DEFAULT 0.1
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
  }
}
