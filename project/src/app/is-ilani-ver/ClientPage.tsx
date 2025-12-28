"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PostJobClientPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/giris?redirect=/is-ilani-ver");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Yeni İş İlanı Oluştur
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              İş ilanınızı yayınlayın ve binlerce yetenekli profesyonele ulaşın.
            </p>
          </div>

          <form className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                İş Ünvanı
              </label>
              <input 
                id="jobTitle" 
                type="text"
                placeholder="Örn: Senior Mimar, Proje Yöneticisi" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Şirket Adı
              </label>
              <input 
                id="companyName" 
                type="text"
                placeholder="Örn: ABC Mimarlık" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Konum
                </label>
                <input 
                  id="location" 
                  type="text"
                  placeholder="Örn: İstanbul, Türkiye" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Çalışma Şekli
                </label>
                <select 
                  id="jobType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="full-time">Tam Zamanlı</option>
                  <option value="part-time">Yarı Zamanlı</option>
                  <option value="freelance">Serbest (Freelance)</option>
                  <option value="internship">Staj</option>
                </select>
              </div>
            </div>

            {/* Experience and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Deneyim Seviyesi
                </label>
                <select 
                  id="experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="entry">Giriş Seviyesi (0-1 yıl)</option>
                  <option value="junior">Junior (1-3 yıl)</option>
                  <option value="mid">Orta Seviye (3-5 yıl)</option>
                  <option value="senior">Senior (5-8 yıl)</option>
                  <option value="lead">Lider (8+ yıl)</option>
                </select>
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Maaş Aralığı (Opsiyonel)
                </label>
                <input 
                  id="salary" 
                  type="text"
                  placeholder="Örn: ₺10,000 - ₺15,000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                İş Tanımı
              </label>
              <textarea 
                id="description" 
                rows={6}
                placeholder="İşin tanımını, sorumluluklarını ve beklentileri detaylıca açıklayın." 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Gereksinimler (Her satıra bir gereksinim)
              </label>
              <textarea 
                id="requirements" 
                rows={4}
                placeholder="Örn:&#10;- Mimarlık fakültesi mezunu&#10;- AutoCAD, Revit bilgisi" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Benefits */}
            <div>
              <label htmlFor="benefits" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sunulan İmkanlar (Opsiyonel)
              </label>
              <textarea 
                id="benefits" 
                rows={3}
                placeholder="Örn:&#10;- Özel sağlık sigortası&#10;- Yemek kartı" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input type="checkbox" id="remote" className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="remote" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Uzaktan Çalışma İmkanı
                </label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="urgent" className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="urgent" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Acil İş İlanı
                </label>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    E-posta
                  </label>
                  <input 
                    id="contactEmail" 
                    type="email"
                    placeholder="info@sirketiniz.com" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Telefon (Opsiyonel)
                  </label>
                  <input 
                    id="contactPhone" 
                    type="tel"
                    placeholder="+90 5xx xxx xx xx" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="contactWebsite" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Web Sitesi (Opsiyonel)
                  </label>
                  <input 
                    id="contactWebsite" 
                    type="url"
                    placeholder="https://www.sirketiniz.com" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              İlanı Yayınla
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
