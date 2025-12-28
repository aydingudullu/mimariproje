#!/usr/bin/env npx ts-node

/**
 * Database Backup CLI Script
 * Kullanım:
 *   npx ts-node scripts/backup.ts create     - Yeni backup oluştur
 *   npx ts-node scripts/backup.ts list       - Backup'ları listele
 *   npx ts-node scripts/backup.ts restore <filename> - Backup'tan geri yükle
 *   npx ts-node scripts/backup.ts delete <filename>  - Backup'ı sil
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { BackupService } from '../src/services/backup.service';

const backupService = new BackupService();

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  console.log('🗄️  Mimariproje Database Backup Tool\n');

  switch (command) {
    case 'create':
      console.log('📦 Backup oluşturuluyor...');
      const createResult = await backupService.createBackup();
      if (createResult.success) {
        console.log('✅ Backup başarıyla oluşturuldu!');
        console.log(`   Dosya: ${createResult.filename}`);
        console.log(`   Boyut: ${formatSize(createResult.size || 0)}`);
        console.log(`   Zaman: ${createResult.timestamp}`);
      } else {
        console.error('❌ Backup başarısız:', createResult.error);
        process.exit(1);
      }
      break;

    case 'list':
      console.log('📋 Mevcut backup\'lar:\n');
      const backups = backupService.listBackups();
      if (backups.length === 0) {
        console.log('   Henüz backup yok.');
      } else {
        backups.forEach((b, i) => {
          console.log(`   ${i + 1}. ${b.filename}`);
          console.log(`      Boyut: ${formatSize(b.size)} | Tarih: ${b.createdAt.toLocaleString('tr-TR')}`);
        });
      }
      break;

    case 'restore':
      if (!arg) {
        console.error('❌ Kullanım: npx ts-node scripts/backup.ts restore <filename>');
        process.exit(1);
      }
      console.log(`🔄 Geri yükleniyor: ${arg}...`);
      console.warn('⚠️  UYARI: Bu işlem mevcut veritabanını değiştirecek!');
      const restoreResult = await backupService.restoreBackup(arg);
      if (restoreResult.success) {
        console.log('✅ Geri yükleme başarılı!');
      } else {
        console.error('❌ Geri yükleme başarısız:', restoreResult.error);
        process.exit(1);
      }
      break;

    case 'delete':
      if (!arg) {
        console.error('❌ Kullanım: npx ts-node scripts/backup.ts delete <filename>');
        process.exit(1);
      }
      const deleted = backupService.deleteBackup(arg);
      if (deleted) {
        console.log(`✅ Backup silindi: ${arg}`);
      } else {
        console.error('❌ Backup bulunamadı veya silinemedi');
        process.exit(1);
      }
      break;

    default:
      console.log('Kullanım:');
      console.log('  npx ts-node scripts/backup.ts create          Yeni backup oluştur');
      console.log('  npx ts-node scripts/backup.ts list            Backup\'ları listele');
      console.log('  npx ts-node scripts/backup.ts restore <file>  Backup\'tan geri yükle');
      console.log('  npx ts-node scripts/backup.ts delete <file>   Backup\'ı sil');
      break;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

main().catch(console.error);
