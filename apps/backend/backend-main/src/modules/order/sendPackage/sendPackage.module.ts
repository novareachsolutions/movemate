import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SendPackageController } from "./sendPackage.controller";
import { SendAPackageService } from "./sendPackage.service";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [SendPackageController],
  providers: [SendAPackageService],
})
export class AgentModule {}
