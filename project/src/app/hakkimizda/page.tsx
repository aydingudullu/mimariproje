import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Users, 
  Target, 
  Award, 
  Heart,
  Shield,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Instagram
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda - Mimariproje.com",
  description: "Mimariproje.com'un hikayesi, misyonu ve vizyonu. Türkiye'nin mimarlık platformu hakkında bilgi alın.",
};

const team = [
  {
    name: "Ahmet Kaya",
    role: "Kurucu & CEO",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    bio: "15 yıllık mimarlık deneyimi ile Mimariproje.com'u kurdu. Türk mimarlık sektörünün dijitalleşmesine öncülük ediyor.",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Zeynep Demir",
    role: "CTO & Kurucu Ortak",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    bio: "Teknoloji alanında 12 yıllık deneyim. Platformun teknik altyapısından ve geliştirme süreçlerinden sorumlu.",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Mehmet Özkan",
    role: "Ürün Müdürü",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    bio: "Kullanıcı deneyimi ve ürün geliştirme konusunda uzman. Platformun sürekli gelişimini sağlıyor.",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Fatma Yılmaz",
    role: "Pazarlama Müdürü",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    bio: "Dijital pazarlama ve topluluk yönetimi alanında 8 yıllık deneyim. Platformun büyümesini destekliyor.",
    linkedin: "#",
    twitter: "#"
  }
];

const values = [
  {
    icon: Shield,
    title: "Güvenilirlik",
    description: "Kullanıcılarımızın güvenliği ve gizliliği bizim için en önemli öncelik. Tüm işlemlerimizde şeffaflık ve güvenilirlik ilkesini benimseriz."
  },
  {
    icon: Zap,
    title: "İnovasyon",
    description: "Teknolojinin gücünü kullanarak mimarlık sektörüne yenilikçi çözümler sunuyoruz. Sürekli gelişim ve yenilik odaklı yaklaşımımızla sektöre değer katıyoruz."
  },
  {
    icon: Users,
    title: "Topluluk",
    description: "Güçlü bir mimarlık topluluğu oluşturarak profesyonellerin birbirleriyle bağlantı kurmasını ve işbirliği yapmasını sağlıyoruz."
  },
  {
    icon: Heart,
    title: "Kalite",
    description: "Platformumuzda yer alan tüm projeler ve hizmetler için yüksek kalite standartlarını koruyoruz. Mükemmellik arayışımız hiç bitmez."
  }
];

const milestones = [
  {
    year: "2019",
    title: "Kuruluş",
    description: "Mimariproje.com'un temelleri atıldı. İlk beta versiyonu yayınlandı."
  },
  {
    year: "2020",
    title: "İlk 1000 Kullanıcı",
    description: "Platform ilk 1000 kullanıcısına ulaştı. Proje satış özelliği eklendi."
  },
  {
    year: "2021",
    title: "Mobil Uygulama",
    description: "iOS ve Android mobil uygulamaları yayınlandı. Kullanıcı sayısı 5000'e ulaştı."
  },
  {
    year: "2022",
    title: "Uluslararası Genişleme",
    description: "Platform İngilizce ve Çince dil desteği ile uluslararası kullanıcılara açıldı."
  },
  {
    year: "2023",
    title: "AI Entegrasyonu",
    description: "Yapay zeka destekli proje önerileri ve otomatik eşleştirme sistemi devreye alındı."
  },
  {
    year: "2024",
    title: "Büyük Büyüme",
    description: "50,000+ aktif kullanıcı, 10,000+ tamamlanan proje ve 500+ firma ile büyük başarı."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-50 dark:from-slate-800 dark:to-slate-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4 mr-2" />
              Hakkımızda
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Türkiye'nin Mimarlık
              <span className="text-primary block">Platformu</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              2019 yılından bu yana Türk mimarlık sektörünü dijitalleştiriyor, 
              mimarlar ve müşteriler arasında köprü kuruyoruz. Binlerce başarılı 
              projeye imza attık.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Misyonumuz
                </h2>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Türkiye'deki mimarlık ve inşaat sektörünü dijitalleştirerek, 
                profesyoneller ve müşteriler arasında güvenli, verimli ve 
                şeffaf bir platform oluşturmak. Kaliteli mimari hizmetlere 
                erişimi demokratikleştirmek ve sektörün gelişimine katkıda bulunmak.
              </p>
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Vizyonumuz
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Türkiye'nin ve bölgenin en büyük mimarlık platformu olmak. 
                Teknoloji ve inovasyonla sektöre öncülük ederek, mimari 
                hizmetlerin kalitesini ve erişilebilirliğini artırmak.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">50K+</div>
                <div className="text-slate-600 dark:text-slate-300">Aktif Kullanıcı</div>
              </Card>
              <Card className="text-center p-6">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">500+</div>
                <div className="text-slate-600 dark:text-slate-300">Mimarlık Firması</div>
              </Card>
              <Card className="text-center p-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">10K+</div>
                <div className="text-slate-600 dark:text-slate-300">Tamamlanan Proje</div>
              </Card>
              <Card className="text-center p-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">99.9%</div>
                <div className="text-slate-600 dark:text-slate-300">Güvenli İşlem</div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Değerlerimiz
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Çalışmalarımızı yönlendiren temel değerler ve ilkelerimiz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Yolculuğumuz
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Kuruluşumuzdan bugüne kadar geçirdiğimiz önemli kilometre taşları
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-slate-800 z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="p-6">
                      <div className="text-2xl font-bold text-primary mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {milestone.description}
                      </p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ekibimiz
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Mimariproje.com'u hayata geçiren deneyimli ve tutkulu ekibimiz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="ghost" size="sm">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Sorularınız mı var? Önerilerinizi paylaşmak mı istiyorsunuz? 
              Ekibimiz sizden haber almaktan mutluluk duyar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center justify-center gap-2 text-blue-100">
                <Mail className="h-5 w-5" />
                <span>info@mimariproje.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-100">
                <Phone className="h-5 w-5" />
                <span>+90 212 555 0123</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-100">
                <MapPin className="h-5 w-5" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button variant="secondary" size="lg">
                İletişim
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Sosyal Medya
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}