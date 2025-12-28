/**
 * Database Backup Service
 * PostgreSQL veritabanı yedekleme servisi
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface BackupConfig {
  databaseUrl: string;
  backupDir: string;
  maxBackups: number; // Tutulacak maksimum backup sayısı
}

interface BackupResult {
  success: boolean;
  filename?: string;
  path?: string;
  size?: number;
  timestamp?: string;
  error?: string;
}

const DEFAULT_CONFIG: BackupConfig = {
  databaseUrl: process.env.DATABASE_URL || '',
  backupDir: path.join(process.cwd(), 'backups'),
  maxBackups: 7, // Son 7 backup'u tut
};

export class BackupService {
  private config: BackupConfig;

  constructor(config?: Partial<BackupConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureBackupDir();
  }

  /**
   * Backup dizininin var olduğundan emin ol
   */
  private ensureBackupDir(): void {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * DATABASE_URL'den connection bilgilerini parse et
   */
  private parseConnectionInfo(): {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
  } | null {
    try {
      // postgresql://user:password@host:port/database
      const url = new URL(this.config.databaseUrl);
      return {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1), // Remove leading /
        user: url.username,
        password: url.password,
      };
    } catch (error) {
      console.error('Invalid DATABASE_URL format:', error);
      return null;
    }
  }

  /**
   * Veritabanının tam yedeğini al
   */
  async createBackup(): Promise<BackupResult> {
    const connectionInfo = this.parseConnectionInfo();
    if (!connectionInfo) {
      return {
        success: false,
        error: 'Geçersiz DATABASE_URL formatı',
      };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${connectionInfo.database}_${timestamp}.sql`;
    const filepath = path.join(this.config.backupDir, filename);

    try {
      // pg_dump komutu - PGPASSWORD environment variable kullan
      const env = {
        ...process.env,
        PGPASSWORD: connectionInfo.password,
      };

      const command = [
        'pg_dump',
        `-h ${connectionInfo.host}`,
        `-p ${connectionInfo.port}`,
        `-U ${connectionInfo.user}`,
        `-d ${connectionInfo.database}`,
        '--format=plain',
        '--no-owner',
        '--no-acl',
        `--file="${filepath}"`,
      ].join(' ');

      await execAsync(command, { env });

      // Dosya boyutunu kontrol et
      const stats = fs.statSync(filepath);

      // Eski backup'ları temizle
      await this.rotateBackups();

      return {
        success: true,
        filename,
        path: filepath,
        size: stats.size,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Backup failed:', error);
      return {
        success: false,
        error: error.message || 'Backup oluşturulurken hata oluştu',
      };
    }
  }

  /**
   * Eski backup'ları sil (rotasyon)
   */
  async rotateBackups(): Promise<void> {
    try {
      const files = fs.readdirSync(this.config.backupDir)
        .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
        .map(f => ({
          name: f,
          path: path.join(this.config.backupDir, f),
          time: fs.statSync(path.join(this.config.backupDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // En yeniden eskiye sırala

      // maxBackups'tan fazla olanları sil
      const toDelete = files.slice(this.config.maxBackups);
      for (const file of toDelete) {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      }
    } catch (error) {
      console.error('Backup rotation failed:', error);
    }
  }

  /**
   * Backup'tan geri yükle
   */
  async restoreBackup(filename: string): Promise<BackupResult> {
    const connectionInfo = this.parseConnectionInfo();
    if (!connectionInfo) {
      return {
        success: false,
        error: 'Geçersiz DATABASE_URL formatı',
      };
    }

    const filepath = path.join(this.config.backupDir, filename);
    if (!fs.existsSync(filepath)) {
      return {
        success: false,
        error: 'Backup dosyası bulunamadı',
      };
    }

    try {
      const env = {
        ...process.env,
        PGPASSWORD: connectionInfo.password,
      };

      const command = [
        'psql',
        `-h ${connectionInfo.host}`,
        `-p ${connectionInfo.port}`,
        `-U ${connectionInfo.user}`,
        `-d ${connectionInfo.database}`,
        `--file="${filepath}"`,
      ].join(' ');

      await execAsync(command, { env });

      return {
        success: true,
        filename,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Restore failed:', error);
      return {
        success: false,
        error: error.message || 'Geri yükleme sırasında hata oluştu',
      };
    }
  }

  /**
   * Mevcut backup'ları listele
   */
  listBackups(): Array<{
    filename: string;
    size: number;
    createdAt: Date;
  }> {
    try {
      return fs.readdirSync(this.config.backupDir)
        .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
        .map(f => {
          const stats = fs.statSync(path.join(this.config.backupDir, f));
          return {
            filename: f,
            size: stats.size,
            createdAt: stats.mtime,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('List backups failed:', error);
      return [];
    }
  }

  /**
   * Belirli bir backup'ı sil
   */
  deleteBackup(filename: string): boolean {
    const filepath = path.join(this.config.backupDir, filename);
    if (!fs.existsSync(filepath)) {
      return false;
    }

    // Güvenlik: sadece backup dosyalarını silmeye izin ver
    if (!filename.startsWith('backup_') || !filename.endsWith('.sql')) {
      return false;
    }

    fs.unlinkSync(filepath);
    return true;
  }
}

// Singleton instance
export const backupService = new BackupService();
