// app/job/src/modules/filesystem/filesystem.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";
import {
  CSV_FILE_PATTERN,
  LOCK_FILE_SUFFIX,
  REPORT_FILE_SUFFIX,
} from "../../constants";

@Injectable()
export class FilesystemService {
  private readonly logger = new Logger(FilesystemService.name);
  private readonly inboxDir: string;
  private readonly processedDir: string;
  private readonly failedDir: string;

  constructor(private readonly configService: ConfigService) {
    this.inboxDir =
      this.configService.get<string>("job.inbox") || "/var/data/inbox";
    this.processedDir =
      this.configService.get<string>("job.processed") || "/var/data/processed";
    this.failedDir =
      this.configService.get<string>("job.failed") || "/var/data/failed";
  }

  async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.inboxDir, { recursive: true });
    await fs.mkdir(this.processedDir, { recursive: true });
    await fs.mkdir(this.failedDir, { recursive: true });
    this.logger.log("Directories ensured");
  }

  async findNewCsvFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.inboxDir);
      return files.filter(
        (file) =>
          CSV_FILE_PATTERN.test(file) && !file.endsWith(LOCK_FILE_SUFFIX),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error reading inbox directory: ${errorMessage}`);
      return [];
    }
  }

  async acquireLock(filename: string): Promise<boolean> {
    const lockFile = path.join(this.inboxDir, `${filename}${LOCK_FILE_SUFFIX}`);
    try {
      await fs.writeFile(lockFile, Date.now().toString(), { flag: "wx" });
      return true;
    } catch (error) {
      return false;
    }
  }

  async releaseLock(filename: string): Promise<void> {
    const lockFile = path.join(this.inboxDir, `${filename}${LOCK_FILE_SUFFIX}`);
    try {
      await fs.unlink(lockFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to release lock for ${filename}: ${errorMessage}`,
      );
    }
  }

  async readCsvFile(filename: string): Promise<string> {
    const filePath = path.join(this.inboxDir, filename);
    return fs.readFile(filePath, "utf-8");
  }

  async moveToProcessed(filename: string): Promise<void> {
    const sourcePath = path.join(this.inboxDir, filename);
    const destPath = path.join(this.processedDir, filename);
    await fs.rename(sourcePath, destPath);
    this.logger.log(`File moved to processed: ${filename}`);
  }

  async moveToFailed(filename: string, report: any): Promise<void> {
    const sourcePath = path.join(this.inboxDir, filename);
    const destPath = path.join(this.failedDir, filename);
    const reportPath = path.join(
      this.failedDir,
      `${filename}${REPORT_FILE_SUFFIX}`,
    );

    await fs.rename(sourcePath, destPath);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.logger.log(`File moved to failed: ${filename}`);
  }

  getInboxPath(filename: string): string {
    return path.join(this.inboxDir, filename);
  }
}
