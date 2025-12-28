import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building, 
  Store, 
  Hammer, 
  Trees, 
  Palette,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Shield,
  Award,
  Zap,
  Target
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hizmetler - Mimariproje.com",
  description: "Mimarlık ve inşaat sektöründe sunduğumuz kapsamlı hizmetleri keşfedin. Tasarımdan uygulamaya kadar tüm ihtiyaçlarınız için çözümler.",
};

const services = [
  {
    id: 1,
    title: "Mimari Tasarım",
    description: "Konut, ticari ve endüstriyel yapılar için kapsamlı mimari tasarım hizmetleri",
    icon: Home,
    features: ["Konsept Tasarım", "Ön Proje", "Uygulama Projesi", "Detay Projeleri"],
    price: "₺5,000'den başlayan fiyatlarla",
    duration: "2-8 hafta",
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "İç Mimari",
    description: "Yaşam ve çalışma alanlarınız için fonksiyonel ve estetik iç mekan tasarımları",
    icon: Palette,
    features: ["Mekan Planlama", "Mobilya Seçimi", "Renk Konsepti", "Aydınlatma Tasarımı"],
    price: "₺3,000'den başlayan fiyatlarla",
    duration: "1-4 hafta",
    color: "bg-purple-500"
  },
  {
    id: 3,
    title: "Peyzaj Mimarlığı",
    description: "Dış mekan düzenlemesi ve peyzaj tasarımı için uzman hizmetleri",
    icon: Trees,
    features: ["Bahçe Tasarımı", "Peyzaj Planlama", "Bitki Seçimi", "Su Öğeleri"],
    price: "₺4,000'den başlayan fiyatlarla",
    duration: "2-6 hafta",
    color: "bg-green-500"
  },
  {
    id: 4,
    title: "Restorasyon",
    description: "Tarihi yapıların korunması ve yenilenmesi için özel restorasyon hizmetleri",
    icon: Hammer,
    features: ["Rölöve Çalışması", "Restitüsyon", "Restorasyon Projesi", "Uygulama Denetimi"],
    price: "₺8,000'den başlayan fiyatlarla",
    duration: "4-12 hafta",
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Proje Yönetimi",
    description: "İnşaat sürecinin başından sonuna kadar profesyonel proje yönetimi",
    icon: Target,
    features: ["Planlama", "Koordinasyon", "Kalite Kontrol", "Zaman Yönetimi"],
    price: "₺6,000'den başlayan fiyatlarla",
    duration: "Proje süresince",
    color: "bg-red-500"
  },
  {
    id: 6,
    title: "3D Modelleme",
    description: "Projelerinizi görselleştirmek için fotorealistik 3D modelleme ve render hizmetleri",
    icon: Zap,
    features: ["3D Modelleme", "Render", "Animasyon", "Sanal Tur"],
    price: "₺2,000'den başlayan fiyatlarla",
    duration: "1-3 hafta",
    color: "bg-pink-500"
  }
];

const packages = [
  {
    id: 1,
    name: "Temel Paket",
    price: "₺5,000",
    description: "Küçük projeler için ideal başlangıç paketi",
    features: [
      "Konsept tasarım",
      "Ön proje çizimleri",
      "3 revizyon hakkı",
      "PDF çıktıları",
      "E-posta desteği"
    ],
    popular: false
  },
  {
    id: 2,
    name: "Profesyonel Paket",
    price: "₺12,000",
    description: "Orta ölçekli projeler için kapsamlı çözüm",
    features: [
      "Detaylı mimari tasarım",
      "Uygulama projeleri",
      "5 revizyon hakkı",
      "3D görselleştirme",
      "Telefon desteği",
      "Malzeme listesi"
    ],
    popular: true
  },
  {
    id: 3,
    name: "Premium Paket",
    price: "₺25,000",
    description: "Büyük projeler için tam hizmet paketi",
    features: [
      "Kapsamlı tasarım süreci",
      "Detay projeleri",
      "Sınırsız revizyon",
      "Fotorealistik renderlar",
      "Proje yönetimi",
      "Sahada danışmanlık",
      "1 yıl garanti"
    ],
    popular: false
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-50 dark:from-slate-800 dark:to-slate-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Mimarlık Hizmetlerimiz
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Tasarımdan uygulamaya kadar tüm mimarlık ihtiyaçlarınız için 
              profesyonel çözümler sunuyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Hizmet Alanlarımız
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Uzman ekibimizle her türlü mimarlık projenizde yanınızdayız
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className={`${service.color} rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {service.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Fiyat:</span>
                        <span className="font-semibold text-primary">{service.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Süre:</span>
                        <span className="font-semibold">{service.duration}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      Teklif Al
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Hizmet Paketleri
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              İhtiyacınıza uygun paketi seçin, profesyonel hizmet alın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary border-2 scale-105' : ''} hover:shadow-lg transition-all duration-300`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      En Popüler
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mt-2">{pkg.price}</div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {pkg.description}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button className={`w-full ${pkg.popular ? 'bg-primary' : ''}`}>
                    Paketi Seç
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Uzman Ekip
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Alanında uzman mimarlar ve tasarımcılardan oluşan profesyonel ekip
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Zamanında Teslimat
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Belirlenen sürelerde kaliteli ve eksiksiz proje teslimi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Güvenli İşlem
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Güvenli ödeme sistemi ve müşteri memnuniyeti garantisi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Kalite Garantisi
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yüksek kalite standartları ve müşteri memnuniyeti odaklı hizmet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Projenizi Hayata Geçirmeye Hazır mısınız?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Uzman ekibimizle iletişime geçin ve hayalinizdeki projeyi birlikte tasarlayalım.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Ücretsiz Danışmanlık
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Portföyümüzü İnceleyin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}