// app/api/src/app.service.ts
import { Injectable } from '@nestjs/common';

const API_NAME = 'Prototype API Mock';
const API_VERSION = '0.1.0';

@Injectable()
export class AppService {
  getHello(): string {
    return `${API_NAME} v${API_VERSION} - Marketplace de Resíduos MVP`;
  }
}
