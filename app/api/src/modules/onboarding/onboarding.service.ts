// app/api/src/modules/onboarding/onboarding.service.ts
import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { MailingService } from '../mailing/mailing.service';
import { RegisterDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';
import { ResendDto } from './dto/resend.dto';
import { OnboardingEligibilityAgent } from '../agents/onboarding-eligibility.agent';
import { EmailDomainGuardAgent } from '../agents/email-domain-guard.agent';
import * as crypto from 'crypto';

const TOKEN_EXPIRATION_HOURS = 24;
const MAX_RESEND_ATTEMPTS_PER_DAY = 3;

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailingService: MailingService,
    private readonly eligibilityAgent: OnboardingEligibilityAgent,
    private readonly domainGuardAgent: EmailDomainGuardAgent,
  ) {}

  /**
   * Registra novo usuário e envia e-mail de ativação
   */
  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    // Verificar se e-mail já existe
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      if (existingUser.status_ativacao === 'ativado') {
        throw new ConflictException('E-mail já cadastrado e ativado');
      }
      if (existingUser.status_ativacao === 'pendente') {
        throw new ConflictException('E-mail já cadastrado. Verifique sua caixa de entrada ou solicite reenvio');
      }
    }

    // Validar domínio do e-mail (apenas Gmail ou Google Workspace)
    const domainCheck = await this.domainGuardAgent.checkDomain(dto.email);
    if (!domainCheck.valid) {
      this.logger.warn(`Domínio não permitido: ${dto.email}`);
      await this.registerActivationLog(
        null,
        'domain_rejected',
        domainCheck.reason || 'Domínio não permitido',
        { domain: domainCheck.domain, provider: domainCheck.provider },
        ipAddress,
        userAgent,
      );
      
      // Enviar e-mail orientando recadastro em https://dominio.com.br
      await this.mailingService.sendDomainRejectionEmail(dto.email, dto.nome);
      
      throw new BadRequestException(
        'Apenas e-mails Gmail ou Google Workspace são aceitos. Você receberá um e-mail com instruções.',
      );
    }

    // Validar elegibilidade com IA
    const eligibilityCheck = await this.eligibilityAgent.checkEligibility({
      email: dto.email,
      nome: dto.nome,
    });

    if (!eligibilityCheck.eligible) {
      this.logger.warn(`Usuário não elegível: ${dto.email}`);
      await this.registerActivationLog(
        null,
        'eligibility_rejected',
        eligibilityCheck.reason,
        { confidence: eligibilityCheck.confidence },
        ipAddress,
        userAgent,
      );
      throw new BadRequestException(
        'Não foi possível validar seu cadastro. Entre em contato com o suporte.',
      );
    }

    // Log de aprovação de elegibilidade
    this.logger.log(`Usuário aprovado pela IA: ${dto.email} (confidence: ${eligibilityCheck.confidence})`);

    // Gerar token único
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

    // Criar usuário com status pendente
    const user = this.userRepository.create({
      email: dto.email,
      status_ativacao: 'pendente',
      token_ativacao: tokenHash,
      token_expires_at: expiresAt,
    });

    await this.userRepository.save(user);

    // Registrar auditoria legada (mantido para compatibilidade)
    await this.registerAudit(user.id, 'registro', ipAddress, userAgent, true, 'Usuário registrado com sucesso');

    // Registrar log de ativação com dados da IA
    await this.registerActivationLog(
      user.id,
      'eligibility_approved',
      eligibilityCheck.reason,
      { confidence: eligibilityCheck.confidence, domain: domainCheck.domain },
      ipAddress,
      userAgent,
    );

    // Enviar e-mail de ativação
    const emailSent = await this.mailingService.sendActivationEmail(dto.email, token, dto.nome);
    
    if (!emailSent) {
      this.logger.error(`Falha ao enviar e-mail de ativação para ${dto.email}`);
      await this.registerAudit(user.id, 'registro', ipAddress, userAgent, false, 'Falha ao enviar e-mail de ativação');
    } else {
      await this.registerActivationLog(
        user.id,
        'token_sent',
        'Token de ativação enviado por e-mail',
        { email: dto.email },
        ipAddress,
        userAgent,
      );
    }

    this.logger.log(`Novo usuário registrado: ${dto.email}`);

    return {
      message: 'Cadastro realizado! Verifique seu e-mail para ativar sua conta.',
    };
  }

  /**
   * Ativa conta de usuário com token
   */
  async activate(dto: ActivateDto, ipAddress?: string, userAgent?: string): Promise<{ message: string; user: any }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      await this.registerAudit(null, 'ativacao', ipAddress, userAgent, false, `Usuário não encontrado: ${dto.email}`);
      await this.registerActivationLog(
        null,
        'activation_denied',
        `Usuário não encontrado: ${dto.email}`,
        { email: dto.email },
        ipAddress,
        userAgent,
      );
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já está ativado
    if (user.status_ativacao === 'ativado') {
      await this.registerAudit(user.id, 'ativacao', ipAddress, userAgent, false, 'Tentativa de reativação de conta já ativada');
      throw new ConflictException('Conta já ativada');
    }

    // Verificar se token existe
    if (!user.token_ativacao) {
      await this.registerAudit(user.id, 'ativacao', ipAddress, userAgent, false, 'Token não encontrado ou já utilizado');
      await this.registerActivationLog(
        user.id,
        'activation_denied',
        'Token não encontrado ou já utilizado',
        {},
        ipAddress,
        userAgent,
      );
      throw new BadRequestException('Token inválido ou já utilizado');
    }

    // Verificar expiração
    if (user.token_expires_at && new Date() > user.token_expires_at) {
      user.status_ativacao = 'expirado';
      await this.userRepository.save(user);
      await this.registerAudit(user.id, 'expiracao', ipAddress, userAgent, false, 'Token expirado');
      await this.registerActivationLog(
        user.id,
        'token_expired',
        'Token expirado',
        { expires_at: user.token_expires_at },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Token expirado. Solicite reenvio do e-mail de ativação.');
    }

    // Validar token
    const tokenHash = this.hashToken(dto.token);
    if (tokenHash !== user.token_ativacao) {
      await this.registerAudit(user.id, 'ativacao', ipAddress, userAgent, false, 'Token inválido');
      await this.registerActivationLog(
        user.id,
        'activation_denied',
        'Token inválido fornecido',
        {},
        ipAddress,
        userAgent,
      );
      throw new BadRequestException('Token inválido');
    }

    // Ativar usuário
    const now = new Date();
    user.status_ativacao = 'ativado';
    user.data_ativacao = now;
    user.email_validado_em = now;
    user.token_ativacao = null;
    user.token_expires_at = null;

    await this.userRepository.save(user);
    await this.registerAudit(user.id, 'ativacao', ipAddress, userAgent, true, 'Conta ativada com sucesso');
    await this.registerActivationLog(
      user.id,
      'activation_confirmed',
      'Conta ativada com sucesso',
      { activated_at: now },
      ipAddress,
      userAgent,
    );

    this.logger.log(`Usuário ativado com sucesso: ${dto.email}`);

    return {
      message: 'Conta ativada com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        status: user.status_ativacao,
      },
    };
  }

  /**
   * Reenvia e-mail de ativação
   */
  async resend(dto: ResendDto, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      await this.registerAudit(null, 'reenvio', ipAddress, userAgent, false, `Usuário não encontrado: ${dto.email}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já está ativado
    if (user.status_ativacao === 'ativado') {
      await this.registerAudit(user.id, 'reenvio', ipAddress, userAgent, false, 'Tentativa de reenvio para conta já ativada');
      throw new ConflictException('Conta já ativada');
    }

    // Verificar limite de reenvios (3 por dia)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const resendCount = await this.getResendCount(user.id, oneDayAgo);
    if (resendCount >= MAX_RESEND_ATTEMPTS_PER_DAY) {
      await this.registerAudit(user.id, 'reenvio', ipAddress, userAgent, false, 'Limite de reenvios excedido');
      throw new BadRequestException('Limite de reenvios excedido. Tente novamente em 24 horas.');
    }

    // Gerar novo token
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

    user.token_ativacao = tokenHash;
    user.token_expires_at = expiresAt;
    user.status_ativacao = 'pendente';

    await this.userRepository.save(user);

    // Enviar e-mail
    const emailSent = await this.mailingService.sendActivationEmail(dto.email, token);
    
    if (!emailSent) {
      this.logger.error(`Falha ao reenviar e-mail de ativação para ${dto.email}`);
      await this.registerAudit(user.id, 'reenvio', ipAddress, userAgent, false, 'Falha ao enviar e-mail');
      throw new BadRequestException('Falha ao enviar e-mail. Tente novamente mais tarde.');
    }

    await this.registerAudit(user.id, 'reenvio', ipAddress, userAgent, true, 'E-mail reenviado com sucesso');

    this.logger.log(`E-mail de ativação reenviado para: ${dto.email}`);

    return {
      message: 'E-mail de ativação reenviado! Verifique sua caixa de entrada.',
    };
  }

  /**
   * Gera token único aleatório
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Cria hash do token para armazenamento
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Conta reenvios nas últimas 24h
   */
  private async getResendCount(userId: number, since: Date): Promise<number> {
    const result = await this.userRepository.query(
      `SELECT COUNT(*) as count 
       FROM tb_user_activation_audit 
       WHERE user_id = $1 
       AND acao = 'reenvio' 
       AND created_at >= $2`,
      [userId, since]
    );
    return parseInt(result[0]?.count || '0', 10);
  }

  /**
   * Registra ação na auditoria (mantido para compatibilidade)
   */
  private async registerAudit(
    userId: number | null,
    acao: string,
    ipAddress?: string,
    userAgent?: string,
    sucesso: boolean = true,
    mensagem?: string,
  ): Promise<void> {
    try {
      await this.userRepository.query(
        `INSERT INTO tb_user_activation_audit 
         (user_id, acao, ip_address, user_agent, sucesso, mensagem) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, acao, ipAddress || null, userAgent || null, sucesso, mensagem || null]
      );
    } catch (error) {
      this.logger.error('Erro ao registrar auditoria:', error);
    }
  }

  /**
   * Registra log de ativação com metadados completos
   */
  private async registerActivationLog(
    userId: number | null,
    status: string,
    reason: string,
    metadata: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.userRepository.query(
        `INSERT INTO tb_user_activation_logs 
         (user_id, status, reason, metadata, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          status,
          reason,
          JSON.stringify(metadata),
          ipAddress || null,
          userAgent || null,
        ]
      );
    } catch (error) {
      this.logger.error('Erro ao registrar log de ativação:', error);
    }
  }
}
