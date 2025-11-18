// app/api/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { UserService } from "../user/user.service";
import { FornecedorService } from "../fornecedor/fornecedor.service";
import { CompradorService } from "../comprador/comprador.service";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly fornecedorService: FornecedorService,
    private readonly compradorService: CompradorService,
  ) {
    this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  async validateGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException("Token inválido");
      }

      const nome =
        payload.name ||
        `${payload.given_name || ""} ${payload.family_name || ""}`.trim() ||
        payload.email?.split("@")[0] ||
        "Usuário";

      return {
        email: payload.email,
        sub: payload.sub,
        nome,
        picture: payload.picture || null,
      };
    } catch (error) {
      throw new UnauthorizedException("Token inválido ou expirado");
    }
  }

  /**
   * Baixar imagem de uma URL e converter para Buffer
   */
  private async downloadImageAsBuffer(url: string): Promise<Buffer | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      return null;
    }
  }

  async googleLogin(idToken: string) {
    const googleUser = await this.validateGoogleToken(idToken);

    if (!googleUser.email) {
      throw new UnauthorizedException("Email não encontrado no token Google");
    }

    const user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      throw new UnauthorizedException("Email não autorizado");
    }

    if (!user.google_id && googleUser.sub) {
      await this.userService.updateGoogleId(user.id, googleUser.sub);
    }

    // Baixar avatar do Google Account se disponível
    let avatarBuffer: Buffer | null = null;
    if (googleUser.picture) {
      avatarBuffer = await this.downloadImageAsBuffer(googleUser.picture);
    }

    // Criar ou encontrar fornecedor e comprador com o nome e avatar do Google Account
    const fornecedor = await this.fornecedorService.findOrCreate(
      googleUser.nome,
      googleUser.email,
      avatarBuffer,
    );
    const comprador = await this.compradorService.findOrCreate(
      googleUser.nome,
      googleUser.email,
      avatarBuffer,
    );

    // Associar fornecedor e comprador ao usuário se ainda não estiverem associados
    const fornecedores = await this.userService.getFornecedores(user.id);
    const compradores = await this.userService.getCompradores(user.id);

    if (!fornecedores.some((f) => f.id === fornecedor.id)) {
      await this.userService.addFornecedor(user.id, fornecedor.id);
    }

    if (!compradores.some((c) => c.id === comprador.id)) {
      await this.userService.addComprador(user.id, comprador.id);
    }

    // Buscar fornecedores e compradores atualizados
    const fornecedoresAtualizados = await this.userService.getFornecedores(
      user.id,
    );
    const compradoresAtualizados = await this.userService.getCompradores(
      user.id,
    );

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fornecedores: fornecedoresAtualizados.map((f) => ({
          id: f.id,
          nome: f.nome,
        })),
        compradores: compradoresAtualizados.map((c) => ({
          id: c.id,
          nome: c.nome,
        })),
      },
    };
  }

  async validateUser(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    const fornecedores = await this.userService.getFornecedores(user.id);
    const compradores = await this.userService.getCompradores(user.id);

    return {
      id: user.id,
      email: user.email,
      fornecedores: fornecedores.map((f) => ({ id: f.id, nome: f.nome })),
      compradores: compradores.map((c) => ({ id: c.id, nome: c.nome })),
    };
  }
}
