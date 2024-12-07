import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentSetup1733584494652 implements MigrationInterface {
  name = "PaymentSetup1733584494652";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "stripeCustomerId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "stripeAccountId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "walletBalance" numeric(10, 2) NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "subscriptionStatus" character varying DEFAULT 'INACTIVE'
        `);
    await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "subscriptionExpiresAt" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "agent"
            ADD "commissionRate" numeric(5, 2) NOT NULL DEFAULT '0.1'
        `);
    await queryRunner.query(`
            ALTER TABLE "order"
            ADD "stripePaymentIntentId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "order"
            ADD "stripeInvoicePaymentIntentId" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "order"
            ADD "paymentStatus" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "paymentStatus"
        `);
    await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "stripeInvoicePaymentIntentId"
        `);
    await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "stripePaymentIntentId"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "commissionRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "subscriptionExpiresAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "subscriptionStatus"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "walletBalance"
        `);
    await queryRunner.query(`
            ALTER TABLE "agent" DROP COLUMN "stripeAccountId"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "stripeCustomerId"
        `);
  }
}
