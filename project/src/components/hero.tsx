"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Users, Building2, Briefcase, Shield, Play } from "lucide-react";
import { useEffect, useState } from "react";

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          {/* Floating circles */}
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
            style={{
              top: '10%',
              left: `${20 + mousePosition.x * 0.02}%`,
              animationDelay: '0s',
              animationDuration: '4s'
            }}
          />
          <div 
            className="absolute w-80 h-80 bg-gradient-to-r from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse"
            style={{
              top: '60%',
              right: `${10 + mousePosition.y * 0.02}%`,
              animationDelay: '2s',
              animationDuration: '6s'
            }}
          />
          <div 
            className="absolute w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"
            style={{
              top: '30%',
              right: `${30 + mousePosition.x * 0.01}%`,
              animationDelay: '1s',
              animationDuration: '5s'
            }}
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjQiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+CjwvZz4KPC9nPgo8L3N2Zz4=')]"></div>
        </div>

        {/* Architectural line art */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
            <path d="M100 500 L200 400 L300 450 L400 350 L500 400 L600 300 L700 350" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{animationDuration: '8s'}} />
            <path d="M150 480 L250 380 L350 430 L450 330 L550 380 L650 280" stroke="currentColor" strokeWidth="1" className="animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}} />
            <rect x="200" y="400" width="60" height="80" stroke="currentColor" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDuration: '4s'}} />
            <rect x="400" y="350" width="80" height="100" stroke="currentColor" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}} />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="py-16 md:py-20 lg:py-24">
          <div className="text-center space-y-8">
            {/* Hero Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Building2 className="w-4 h-4 mr-2" />
                Türkiye'nin #1 Mimarlık Platformu
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
                Türkiye'nin
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 block">Mimarlık Platformu</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Mimarlık firmalarını ve serbest çalışan mimarları bir araya getiren, 
                <span className="text-primary font-semibold">online mimarlık hizmetleri</span> sunan güvenilir platform.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Proje, mimar veya firma arayın..."
                    className="pl-10 border-0 bg-transparent focus:ring-0 text-lg h-12"
                  />
                </div>
                <Button size="lg" className="px-8 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  Ara
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Popüler aramalar: <span className="text-primary">villa tasarımı</span>, <span className="text-primary">iç mimari</span>, <span className="text-primary">proje çizimi</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                Proje Ara
                <Search className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 hover:bg-primary hover:text-white transition-all duration-300">
                Mimar Bul
                <Users className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 hover:bg-primary hover:text-white transition-all duration-300">
                İş İlanı Ver
                <Briefcase className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Video/Demo Button */}
            <div className="flex justify-center">
              <Button variant="ghost" className="group text-slate-600 dark:text-slate-300 hover:text-primary">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white/20 dark:bg-slate-800/20 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                  <span className="text-sm font-medium">Platformu Keşfet</span>
                </div>
              </Button>
            </div>

            {/* Professional Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 max-w-3xl mx-auto backdrop-blur-sm">
              <p className="text-green-700 dark:text-green-300 text-base">
                <strong>Profesyonel misiniz?</strong> Hemen bize katılın ve portföyünüzü sergileyerek yeni müşteriler kazanın!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3 group">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">5,000+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Aktif Kullanıcı</div>
            </div>
            <div className="space-y-3 group">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">1,200+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Mimarlık Firması</div>
            </div>
            <div className="space-y-3 group">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">3,500+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Tamamlanan Proje</div>
            </div>
            <div className="space-y-3 group">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">99.9%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Güvenli İşlem</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}