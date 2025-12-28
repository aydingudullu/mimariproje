'use client';

/**
 * Admin Backup Management Component
 * Veritabanı backup yönetimi
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  Plus,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface Backup {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

export default function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getBackups();
      if (response.success && response.data) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error('Fetch backups error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const response = await adminApi.createBackup();
      if (response.success && response.data) {
        setMessage({ type: 'success', text: `Backup oluşturuldu: ${response.data.filename}` });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: response.error || 'Backup oluşturulamadı' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Bir hata oluştu' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`"${filename}" backup'ını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setDeleting(filename);
    setMessage(null);
    try {
      const response = await adminApi.deleteBackup(filename);
      if (response.success) {
        setMessage({ type: 'success', text: 'Backup silindi' });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: response.error || 'Backup silinemedi' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Bir hata oluştu' });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Veritabanı Yedekleri
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBackups}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreateBackup}
              disabled={creating}
            >
              {creating ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Backup Oluştur
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
            <p className="mt-2 text-slate-500">Yükleniyor...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-slate-300" />
            <p className="mt-2 text-slate-500">Henüz backup yok</p>
            <p className="text-sm text-slate-400">
              Veritabanı yedeği oluşturmak için yukarıdaki butona tıklayın.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div 
                key={backup.filename} 
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {backup.filename}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(backup.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {backup.sizeFormatted}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteBackup(backup.filename)}
                    disabled={deleting === backup.filename}
                  >
                    {deleting === backup.filename ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-500">
            Backup'lar otomatik olarak rotasyona tabi tutulur (son 7 backup tutulur).
            Backup dosyaları sunucuda <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">backups/</code> klasöründe saklanır.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
