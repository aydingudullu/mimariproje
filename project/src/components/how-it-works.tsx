"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, MessageSquare, CreditCard, Star } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Proje veya Uzman Arayın",
    description: "Geniş proje ve uzman veritabanımızdan size uygun olanı bulun",
    icon: Search,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Profil ve Portföy İnceleyin",
    description: "Mimarların geçmiş işlerini ve müşteri yorumlarını inceleyin",
    icon: UserCheck,
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "İletişime Geçin",
    description: "Güvenli mesajlaşma sistemi ile detayları görüşün",
    icon: MessageSquare,
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Güvenli Ödeme Yapın",
    description: "Emanet sistemi ile güvenli ve korumalı ödeme",
    icon: CreditCard,
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Projeyi Teslim Alın",
    description: "İşinizi teslim alın ve deneyiminizi değerlendirin",
    icon: Star,
    color: "bg-pink-500"
  }
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Mimariproje.com'da proje bulma ve uzman ile çalışma süreci çok basit
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={step.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`${step.color} rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {step.id}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Hemen Başlayın!
              </h3>
              <p className="text-lg text-blue-100 mb-6">
                Binlerce proje ve uzman sizi bekliyor. İlk adımı atın ve hayalinizdeki projeyi bulun.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Proje Ara
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Uzman Bul
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}