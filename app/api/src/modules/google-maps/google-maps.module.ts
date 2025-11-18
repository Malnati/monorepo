// app/api/src/modules/google-maps/google-maps.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GoogleMapsService } from "./google-maps.service";

@Module({
  imports: [ConfigModule],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule {}
