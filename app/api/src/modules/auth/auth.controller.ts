// app/api/src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

const ERROR_MSG_TOKEN_REQUIRED = "Token ID do Google é obrigatório";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google")
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() body: { idToken: string }) {
    if (!body.idToken) {
      throw new BadRequestException(ERROR_MSG_TOKEN_REQUIRED);
    }

    return this.authService.googleLogin(body.idToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    return this.authService.validateUser(req.user.sub);
  }
}
