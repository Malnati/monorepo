// app/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TipoModule } from './modules/tipo/tipo.module';
import { UnidadeModule } from './modules/unidade/unidade.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { CompradorModule } from './modules/comprador/comprador.module';
import { LoteResiduoModule } from './modules/lote-residuo/lote-residuo.module';
import { OfferModule } from './modules/offer/offer.module';
import { TransacaoModule } from './modules/transacao/transacao.module';
import { FotosModule } from './modules/fotos/fotos.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { GmailModule } from './modules/gmail/gmail.module';
import { MailingModule } from './modules/mailing/mailing.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { OpenRouterModule } from './modules/openrouter/openrouter.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { OnboardingImportModule } from './modules/onboarding-import/onboarding-import.module';
import { FormaPagamentoModule } from './modules/forma-pagamento/forma-pagamento.module';

const DATABASE_HOST = (process.env.DATABASE_HOST || 'db').trim();
const DATABASE_PORT = parseInt((process.env.DATABASE_PORT || '5432').trim(), 10);
const DATABASE_USER = (process.env.DATABASE_USER || 'postgres').trim();
const DATABASE_PASSWORD = (process.env.DATABASE_PASSWORD || 'postgres').trim();
const DATABASE_NAME = (process.env.DATABASE_NAME || 'db').trim();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      username: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Desabilitado - usar migrations manuais
      logging: process.env.NODE_ENV === 'development',
    }),
    TipoModule,
    UnidadeModule,
    FornecedorModule,
    CompradorModule,
    // @deprecated LoteResiduoModule - Kept for backward compatibility with UI
    // Exposes legacy /lotes endpoints. Will be removed after UI migrates to /offers
    // See: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
    LoteResiduoModule,
    OfferModule, // Current module - use this for new development
    TransacaoModule,
    FotosModule,
    UserModule,
    AuthModule,
    GmailModule,
    MailingModule,
    OnboardingModule,
    OpenRouterModule,
    AgentsModule,
    ModerationModule,
    OnboardingImportModule,
    FormaPagamentoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
