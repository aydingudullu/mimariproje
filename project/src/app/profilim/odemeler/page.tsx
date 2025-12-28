'use client';

/**
 * Ödeme Geçmişi Sayfası
 * Kullanıcının tüm ödemelerini listeler
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Download, 
  Filter,
  Calendar,
  RefreshCw,
  TrendingUp,
  Receipt,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { transactionApi } from '@/lib/api';

interface Transaction {
  id: number;
  amount: string;
  currency: string;
  payment_type: string;
  status: string;
  description?: string;
  created_at: string;
  projects?: { id: number; title: string };
  jobs?: { id: number; title: string };
}

interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
}

export default function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const options: any = {};
      if (filter) options.status = filter;

      const response = await transactionApi.getHistory(options);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY'
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Tamamlandı' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Beklemede' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Başarısız' },
      refunded: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, label: 'İade Edildi' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getPaymentTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      subscription: 'Abonelik',
      project_boost: 'Proje Öne Çıkarma',
      job_boost: 'İlan Öne Çıkarma',
      purchase: 'Satın Alma',
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Ödeme Geçmişi
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Tüm ödemelerinizi ve işlemlerinizi görüntüleyin
            </p>
          </div>
          <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Toplam İşlem
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {summary.totalTransactions}
                    </p>
                  </div>
                  <div className="bg-blue-500 rounded-lg p-3">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Toplam Harcama
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatAmount(summary.totalAmount.toString(), 'TRY')}
                    </p>
                  </div>
                  <div className="bg-green-500 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 mr-2">Filtre:</span>
              {['', 'completed', 'pending', 'failed'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === '' ? 'Tümü' : 
                   status === 'completed' ? 'Tamamlanan' :
                   status === 'pending' ? 'Bekleyen' : 'Başarısız'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                <p className="mt-2 text-slate-500">Yükleniyor...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto text-slate-300" />
                <p className="mt-4 text-slate-500">Henüz ödeme işleminiz bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {getPaymentTypeBadge(tx.payment_type)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {tx.description || (tx.projects?.title) || (tx.jobs?.title) || 'Ödeme'}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(tx.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        {formatAmount(tx.amount, tx.currency)}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
