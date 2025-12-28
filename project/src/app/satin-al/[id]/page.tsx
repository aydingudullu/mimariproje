import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Download,
  FileText,
  Lock,
  Info,
  AlertCircle,
  Clock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Satın Al - Modern Villa Tasarımı - Mimariproje.com",
  description: "Güvenli ödeme ile Modern Villa Tasarımı projesini satın alın.",
};

// Mock data
const project = {
  id: "modern-villa-tasarimi",
  title: "Modern Villa Tasarımı",
  price: 15000,
  originalPrice: 18000,
  currency: "₺",
  image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
  architect: {
    name: "Ahmet Yılmaz",
    company: "Yılmaz Mimarlık"
  },
  deliverables: [
    "Vaziyet Planı",
    "Kat Planları (Zemin + 1. Kat)",
    "Görünüş Çizimleri (4 Cephe)",
    "Kesit Çizimleri",
    "3D Render Görselleri (5 Adet)",
    "AutoCAD Dosyaları (.dwg)",
    "PDF Çıktıları"
  ],
  license: {
    type: "Tek Kullanım",
    description: "Bu proje sadece bir kez inşa edilebilir."
  }
};

const platformFee = project.price * 0.05; // %5 platform ücreti
const total = project.price + platformFee;

export default function PurchasePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href={`/proje/${project.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Güvenli Ödeme
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {project.title} - Satın Alma İşlemi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="space-y-6">
              {/* Progress Steps */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        1
                      </div>
                      <span className="text-sm font-medium">Ödeme Bilgileri</span>
                    </div>
                    <div className="flex items-center space-x-2 opacity-50">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 text-sm">
                        2
                      </div>
                      <span className="text-sm">Onay</span>
                    </div>
                    <div className="flex items-center space-x-2 opacity-50">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 text-sm">
                        3
                      </div>
                      <span className="text-sm">Tamamlandı</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ödeme Yöntemi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border-2 border-primary rounded-lg p-3 cursor-pointer">
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <div className="text-xs font-medium">Kredi Kartı</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary">
                      <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-1 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                          P
                        </div>
                        <div className="text-xs">PayPal</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary">
                      <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-1 bg-green-600 rounded text-white text-xs flex items-center justify-center">
                          B
                        </div>
                        <div className="text-xs">Banka</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Kart Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Kart Numarası</label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Son Kullanma</label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <Input placeholder="123" type="password" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kart Sahibi</label>
                    <Input placeholder="Ad Soyad" />
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Fatura Adresi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ad</label>
                      <Input placeholder="Adınız" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Soyad</label>
                      <Input placeholder="Soyadınız" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-posta</label>
                    <Input type="email" placeholder="ornek@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Adres</label>
                    <Input placeholder="Tam adresiniz" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Şehir</label>
                      <Input placeholder="İstanbul" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Posta Kodu</label>
                      <Input placeholder="34000" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input type="checkbox" className="mt-1" />
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <Link href="/kullanim-kosullari" className="text-primary hover:underline">Kullanım Koşulları</Link>'nı ve{' '}
                      <Link href="/gizlilik-politikasi" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Project Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-4">
                    <div className="w-20 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={80}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold line-clamp-2">{project.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {project.architect.name} - {project.architect.company}
                      </p>
                      <Badge className="mt-1">{project.license.type}</Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Proje Fiyatı:</span>
                      <span>{project.currency}{project.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Platform Ücreti (%5):</span>
                      <span>{project.currency}{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Toplam:</span>
                      <span className="text-primary">{project.currency}{total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What You Get */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Alacaklarınız
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.deliverables.map((item) => (
                      <div key={item} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Güvenlik Garantileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-green-500" />
                      256-bit SSL şifreleme
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-500" />
                      PCI DSS uyumlu ödeme
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      7 gün para iade garantisi
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                      Anında dosya erişimi
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* License Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Lisans Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          {project.license.type}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          {project.license.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Purchase */}
              <Card>
                <CardContent className="p-6">
                  <Button className="w-full" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Ödemeyi Tamamla - {project.currency}{total.toLocaleString()}
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                      <Shield className="h-3 w-3" />
                      <span>Güvenli ödeme Stripe tarafından sağlanmaktadır</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Yardıma mı ihtiyacınız var?
                  </div>
                  <Link href="/iletisim" className="text-primary hover:underline text-sm">
                    Destek ekibimizle iletişime geçin
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