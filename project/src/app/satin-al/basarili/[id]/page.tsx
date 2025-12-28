import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Download, 
  Mail, 
  FileText, 
  Star,
  ArrowRight,
  Share2,
  MessageCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Satın Alma Başarılı - Mimariproje.com",
  description: "Projeniz başarıyla satın alındı. Dosyalarınızı indirmeye başlayabilirsiniz.",
};

// Mock data
const purchase = {
  id: "PUR-2024-001234",
  date: "15 Ocak 2024, 14:30",
  project: {
    id: "modern-villa-tasarimi",
    title: "Modern Villa Tasarımı",
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
    architect: {
      name: "Ahmet Yılmaz",
      company: "Yılmaz Mimarlık"
    }
  },
  amount: 15750,
  currency: "₺",
  paymentMethod: "Kredi Kartı (**** 1234)",
  
  downloads: [
    {
      id: 1,
      name: "Vaziyet Planı",
      type: "PDF",
      size: "2.4 MB",
      url: "#"
    },
    {
      id: 2,
      name: "Kat Planları",
      type: "DWG",
      size: "5.8 MB",
      url: "#"
    },
    {
      id: 3,
      name: "Görünüş Çizimleri",
      type: "PDF",
      size: "8.2 MB",
      url: "#"
    },
    {
      id: 4,
      name: "3D Render Görselleri",
      type: "ZIP",
      size: "45.6 MB",
      url: "#"
    },
    {
      id: 5,
      name: "Teknik Detaylar",
      type: "PDF",
      size: "12.3 MB",
      url: "#"
    }
  ]
};

export default function PurchaseSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Satın Alma İşlemi Başarılı!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Projeniz başarıyla satın alındı. Dosyalarınızı aşağıdan indirebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Purchase Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Satın Alma Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-6">
                    <div className="w-20 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={purchase.project.image}
                        alt={purchase.project.title}
                        width={80}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{purchase.project.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {purchase.project.architect.name} - {purchase.project.architect.company}
                      </p>
                      <Badge className="mt-1">Tek Kullanım Lisansı</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-300">Sipariş No:</span>
                      <div className="font-semibold">{purchase.id}</div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-300">Tarih:</span>
                      <div className="font-semibold">{purchase.date}</div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-300">Tutar:</span>
                      <div className="font-semibold text-primary">
                        {purchase.currency}{purchase.amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-300">Ödeme:</span>
                      <div className="font-semibold">{purchase.paymentMethod}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Downloads */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Download className="h-5 w-5 mr-2" />
                      Dosyalarınız
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      Tümünü İndir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchase.downloads.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-sm text-slate-500">
                              {file.type} • {file.size}
                            </div>
                          </div>
                        </div>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          İndir
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          E-posta Gönderildi
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          Tüm dosyalar e-posta adresinize de gönderilmiştir. Spam klasörünüzü kontrol etmeyi unutmayın.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* License Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Lisans Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <h4 className="font-semibold mb-2">Tek Kullanım Lisansı</h4>
                      <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <li>• Bu proje sadece bir kez inşa edilebilir</li>
                        <li>• Ticari kullanım hakları dahildir</li>
                        <li>• Küçük değişiklikler yapılabilir</li>
                        <li>• Yeniden satış yasaktır</li>
                        <li>• Telif hakları mimarına aittir</li>
                      </ul>
                    </div>
                    
                    <div className="text-sm text-slate-500">
                      Lisans koşulları hakkında sorularınız için{' '}
                      <Link href="/iletisim" className="text-primary hover:underline">
                        destek ekibimizle iletişime geçin
                      </Link>.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Sonraki Adımlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      1
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Dosyaları İndirin</div>
                      <div className="text-slate-600 dark:text-slate-300">
                        Tüm proje dosyalarını bilgisayarınıza kaydedin
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      2
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Projeyi İnceleyin</div>
                      <div className="text-slate-600 dark:text-slate-300">
                        Planları ve detayları dikkatli bir şekilde inceleyin
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      3
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Mimar ile İletişim</div>
                      <div className="text-slate-600 dark:text-slate-300">
                        Sorularınız için mimarla iletişime geçebilirsiniz
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Architect */}
              <Card>
                <CardHeader>
                  <CardTitle>Mimar ile İletişim</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-xl font-semibold">
                        {purchase.project.architect.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-semibold">{purchase.project.architect.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {purchase.project.architect.company}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mesaj Gönder
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Profili Görüntüle
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Project */}
              <Card>
                <CardHeader>
                  <CardTitle>Projeyi Değerlendirin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="flex justify-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-6 w-6 text-slate-300 hover:text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Deneyiminizi diğer kullanıcılarla paylaşın
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full" size="sm">
                    Değerlendirme Yap
                  </Button>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardHeader>
                  <CardTitle>Paylaş</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Bu projeyi beğenen arkadaşlarınızla paylaşın
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Projeyi Paylaş
                  </Button>
                </CardContent>
              </Card>

              {/* Browse More */}
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold mb-2">Daha Fazla Proje</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Benzer projeler keşfedin
                  </p>
                  <Link href="/projeler">
                    <Button variant="outline" className="w-full" size="sm">
                      Projeleri Keşfet
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}