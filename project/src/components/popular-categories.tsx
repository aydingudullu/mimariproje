"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Building, 
  Store, 
  Hammer, 
  Trees, 
  Palette,
  ArrowRight,
  Users
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    id: 1,
    name: "Konut Projeleri",
    description: "Villa, ev, apartman tasarımları",
    icon: Home,
    count: 1250,
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Ticari Projeler",
    description: "Ofis, mağaza, restoran tasarımları",
    icon: Building,
    count: 890,
    color: "bg-green-500"
  },
  {
    id: 3,
    name: "Mağaza Tasarımı",
    description: "Perakende ve ticari alan tasarımları",
    icon: Store,
    count: 650,
    color: "bg-purple-500"
  },
  {
    id: 4,
    name: "Tadilat & Renovasyon",
    description: "Mevcut yapıların yenilenmesi",
    icon: Hammer,
    count: 780,
    color: "bg-orange-500"
  },
  {
    id: 5,
    name: "Peyzaj Mimarlığı",
    description: "Bahçe ve dış mekan tasarımları",
    icon: Trees,
    count: 420,
    color: "bg-emerald-500"
  },
  {
    id: 6,
    name: "İç Mimari",
    description: "İç mekan tasarımı ve dekorasyon",
    icon: Palette,
    count: 1340,
    color: "bg-pink-500"
  }
];

export function PopularCategories() {
  return (
    <section className="py-16 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Popüler Kategoriler
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            En çok tercih edilen mimari hizmet kategorilerini keşfedin
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${category.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-500">
                          <Users className="h-4 w-4 mr-1" />
                          {category.count.toLocaleString()} proje
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">
                Proje Arayın
              </h3>
              <p className="text-blue-100 mb-4">
                Binlerce hazır mimari proje arasından size uygun olanı bulun
              </p>
              <Button variant="secondary" asChild>
                <Link href="/projeler">
                  Projeleri Keşfet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">
                Profesyonel Bulun
              </h3>
              <p className="text-green-100 mb-4">
                Deneyimli mimarlar ve firmalar ile projenizi hayata geçirin
              </p>
              <Button variant="secondary" asChild>
                <Link href="/uzmanlar">
                  Uzman Bulun
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}