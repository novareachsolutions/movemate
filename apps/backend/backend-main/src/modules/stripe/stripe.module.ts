import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "60s" },
    }),
  ],
  providers: [StripeService],
  controllers: [StripeController],
})
export class StripeModule {}
