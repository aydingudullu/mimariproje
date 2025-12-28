'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Mail, 
  RefreshCw,
  Building2 
} from 'lucide-react';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'E-posta adresiniz başarıyla doğrulandı!');
      } else {
        setStatus('error');
        setMessage(data.error || 'E-posta doğrulama başarısız oldu.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const accessToken = localStorage.getItem('mimariproje_access_token');
      
      if (!accessToken) {
        router.push('/auth/giris');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.');
        setStatus('no-token');
      } else {
        setMessage(data.error || 'E-posta gönderilemedi.');
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 mb-8"
          >
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">
              Mimariproje.com
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            {/* Loading State */}
            {status === 'loading' && (
              <>
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-6 animate-pulse">
                  <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  E-posta Doğrulanıyor...
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Lütfen bekleyin, e-posta adresiniz doğrulanıyor.
                </p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  🎉 E-posta Doğrulandı!
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push('/dashboard')}
                  >
                    Dashboard'a Git
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/profil">
                    <Button variant="outline" className="w-full">
                      Profilini Tamamla
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 mb-6">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Doğrulama Başarısız
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tekrar Gönder
                      </>
                    )}
                  </Button>
                  <Link href="/auth/giris">
                    <Button variant="outline" className="w-full">
                      Giriş Sayfasına Dön
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* No Token State */}
            {status === 'no-token' && (
              <>
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900 mb-6">
                  <Mail className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  E-posta Doğrulama
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {message || 'E-posta adresinize gönderilen doğrulama bağlantısına tıklayın veya aşağıdaki butonu kullanarak yeni bir bağlantı isteyin.'}
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Doğrulama E-postası Gönder
                      </>
                    )}
                  </Button>
                  <Link href="/auth/giris">
                    <Button variant="outline" className="w-full">
                      Giriş Sayfasına Dön
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Sorun mu yaşıyorsunuz?{' '}
          <Link href="/iletisim" className="text-primary hover:underline">
            Bizimle iletişime geçin
          </Link>
        </p>
      </div>
    </div>
  );
}
