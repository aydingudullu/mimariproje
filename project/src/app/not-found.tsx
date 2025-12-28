'use client';

/**
 * 404 - Sayfa Bulunamadı
 * Next.js App Router not-found page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] md:text-[240px] font-black text-slate-100 dark:text-slate-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-6">
              <FileQuestion className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Sayfa Bulunamadı
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Ana Sayfaya Dön
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-slate-300 dark:border-slate-600"
          >
            <Link href="/projeler">
              <Search className="mr-2 h-5 w-5" />
              Projelere Göz At
            </Link>
          </Button>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Önceki Sayfaya Geri Dön
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sorun yaşamaya devam ediyorsanız{' '}
            <Link href="/iletisim" className="text-blue-600 hover:underline">
              destek ekibimizle iletişime geçin
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
