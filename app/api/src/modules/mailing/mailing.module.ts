// app/api/src/modules/mailing/mailing.module.ts
import { Module } from "@nestjs/common";
import { MailingService } from "./mailing.service";

@Module({
  providers: [MailingService],
  exports: [MailingService],
})
export class MailingModule {}
