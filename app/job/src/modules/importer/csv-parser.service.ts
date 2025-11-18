// app/job/src/modules/importer/csv-parser.service.ts

import { Injectable, Logger } from "@nestjs/common";
import * as csv from "fast-csv";
import { Readable } from "stream";
import {
  CsvRow,
  NormalizedUser,
  ValidationError,
} from "../../types/csv-row.interface";
import {
  CSV_ENCODING,
  CPF_LENGTH,
  PHONE_E164_PREFIX,
  STATUS_SUBSCRIBED,
  STATUS_PF,
  STATUS_PJ,
} from "../../constants";

@Injectable()
export class CsvParserService {
  private readonly logger = new Logger(CsvParserService.name);

  async parseCsv(
    content: string,
  ): Promise<{ rows: CsvRow[]; errors: ValidationError[] }> {
    const rows: CsvRow[] = [];
    const errors: ValidationError[] = [];

    // Remove BOM se presente
    const cleanContent = content.replace(/^\uFEFF/, "");

    return new Promise((resolve, reject) => {
      const stream = Readable.from(cleanContent);

      stream
        .pipe(csv.parse({ headers: true, trim: true }))
        .on("data", (row: CsvRow) => {
          rows.push(row);
        })
        .on("error", (error) => {
          reject(error);
        })
        .on("end", () => {
          resolve({ rows, errors });
        });
    });
  }

  normalizeUser(
    row: CsvRow,
    lineNumber: number,
  ): { user?: NormalizedUser; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Validar e normalizar email
    const email = row["E-mail"]?.trim().toLowerCase();
    if (!email || !this.isValidEmail(email)) {
      errors.push({
        line: lineNumber,
        field: "E-mail",
        value: email,
        error: "Email inválido",
      });
    }

    // Validar e normalizar nome completo
    const fullName = row["Nome completo"]?.trim();
    if (!fullName) {
      errors.push({
        line: lineNumber,
        field: "Nome completo",
        value: fullName,
        error: "Nome completo obrigatório",
      });
    }

    // Validar e normalizar CPF
    const document = this.normalizeCpf(row["CPF"]);
    if (!document || document.length !== CPF_LENGTH) {
      errors.push({
        line: lineNumber,
        field: "CPF",
        value: row["CPF"],
        error: "CPF inválido (deve ter 11 dígitos)",
      });
    }

    // Validar e normalizar data de nascimento
    const birthDate = this.normalizeDate(row["Data de nascimento"]);
    if (!birthDate) {
      errors.push({
        line: lineNumber,
        field: "Data de nascimento",
        value: row["Data de nascimento"],
        error: "Data de nascimento inválida (formato esperado: DD/MM/YYYY)",
      });
    }

    // Validar e normalizar telefone
    const phone = this.normalizePhone(row["Telefone"]);
    if (!phone) {
      errors.push({
        line: lineNumber,
        field: "Telefone",
        value: row["Telefone"],
        error: "Telefone inválido",
      });
    }

    // Validar CEP
    const cep = this.normalizeCep(row["CEP"]);
    if (!cep) {
      errors.push({
        line: lineNumber,
        field: "CEP",
        value: row["CEP"],
        error: "CEP inválido",
      });
    }

    // Validar userType
    const userType = row["Lista"] as "PF" | "PJ";
    if (userType !== STATUS_PF && userType !== STATUS_PJ) {
      errors.push({
        line: lineNumber,
        field: "Lista",
        value: userType,
        error: "Tipo de usuário deve ser PF ou PJ",
      });
    }

    if (errors.length > 0) {
      return { errors };
    }

    const user: NormalizedUser = {
      email,
      fullName,
      document,
      birthDate,
      phone,
      address: {
        cep,
        city: row["Cidade"]?.trim(),
        state: row["Estado"]?.trim(),
      },
      userType,
      consent: {
        terms: !!row["Lgpd_termos"],
        authorization: !!row["Lgpd_autorizacao"],
      },
    };

    return { user, errors: [] };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private normalizeCpf(cpf: string): string {
    if (!cpf) return "";
    return cpf.replace(/\D/g, "");
  }

  private normalizeDate(date: string): string {
    if (!date) return "";

    // Formato esperado: DD/MM/YYYY
    const parts = date.split("/");
    if (parts.length !== 3) return "";

    const [day, month, year] = parts;
    if (!day || !month || !year) return "";

    // Converter para ISO8601: YYYY-MM-DD
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  private normalizePhone(phone: string): string {
    if (!phone) return "";

    // Remover formatação
    const digits = phone.replace(/\D/g, "");

    // Adicionar prefixo +55 se não tiver
    if (digits.length === 10 || digits.length === 11) {
      return `${PHONE_E164_PREFIX}${digits}`;
    }

    return "";
  }

  private normalizeCep(cep: string): string {
    if (!cep) return "";

    // Remover formatação e validar
    const digits = cep.replace(/\D/g, "");

    if (digits.length === 8) {
      return `${digits.substring(0, 5)}-${digits.substring(5)}`;
    }

    return "";
  }

  deduplicateUsers(users: NormalizedUser[]): NormalizedUser[] {
    const userMap = new Map<string, NormalizedUser>();

    for (const user of users) {
      const key = `${user.email}:${user.userType}`;

      // Se já existe, manter apenas se for subscribed
      const existing = userMap.get(key);
      if (!existing) {
        userMap.set(key, user);
      }
    }

    return Array.from(userMap.values());
  }
}
