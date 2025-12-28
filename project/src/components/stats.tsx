"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Building2, Briefcase, Award, Globe } from "lucide-react";

const stats = [
  {
    id: 1,
    title: "Toplam Kullanıcı",
    value: "12,500+",
    growth: "+15%",
    icon: Users,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Aktif Projeler",
    value: "3,200+",
    growth: "+22%",
    icon: Briefcase,
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Mimarlık Firması",
    value: "1,800+",
    growth: "+18%",
    icon: Building2,
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Tamamlanan İş",
    value: "8,900+",
    growth: "+25%",
    icon: Award,
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Şehir",
    value: "81",
    growth: "Türkiye'nin tamamı",
    icon: Globe,
    color: "bg-pink-500"
  },
  {
    id: 6,
    title: "Başarı Oranı",
    value: "98.5%",
    growth: "+2.1%",
    icon: TrendingUp,
    color: "bg-emerald-500"
  }
];

export function Stats() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Platformumuz Rakamlarla
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Türkiye'nin en büyük mimarlık platformunda her gün büyüyen bir topluluk
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {stat.growth}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {stat.title}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold">2019</div>
                  <div className="text-blue-100">Kuruluş Yılı</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">₺50M+</div>
                  <div className="text-blue-100">İşlem Hacmi</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-blue-100">Müşteri Desteği</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}