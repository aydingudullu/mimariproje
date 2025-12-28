import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  MessageCircle,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim - Mimariproje.com",
  description: "Bizimle iletişime geçin. Sorularınız, önerileriniz ve işbirliği teklifleriniz için bize ulaşın.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-50 dark:from-slate-800 dark:to-slate-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              İletişime Geçin
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Sorularınız, önerileriniz ve işbirliği teklifleriniz için 
              bizimle iletişime geçmekten çekinmeyin.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Mesaj Gönderin</CardTitle>
                  <p className="text-slate-600 dark:text-slate-300">
                    Formu doldurarak bizimle iletişime geçebilirsiniz. En kısa sürede size dönüş yapacağız.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Ad
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="Adınız"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Soyad
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        E-posta Adresi
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="ornek@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Telefon (Opsiyonel)
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+90 555 123 45 67"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Konu
                      </label>
                      <select 
                        id="subject" 
                        name="subject" 
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      >
                        <option value="">Konu seçin</option>
                        <option value="general">Genel Bilgi</option>
                        <option value="support">Teknik Destek</option>
                        <option value="business">İş Birliği</option>
                        <option value="complaint">Şikayet</option>
                        <option value="suggestion">Öneri</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Mesajınız
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Mesajınızı buraya yazın..."
                      />
                    </div>

                    <div className="flex items-start">
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded mt-1"
                      />
                      <label htmlFor="privacy" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                        <a href="/gizlilik-politikasi" className="text-primary hover:underline">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                      </label>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Mesajı Gönder
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Adres</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Maslak Mahallesi, Büyükdere Caddesi<br />
                        No: 123, Kat: 5<br />
                        34485 Sarıyer / İstanbul
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Telefon</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        +90 212 555 0123<br />
                        +90 555 123 45 67
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">E-posta</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        info@mimariproje.com<br />
                        destek@mimariproje.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Çalışma Saatleri</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Pazartesi - Cuma: 09:00 - 18:00<br />
                        Cumartesi: 10:00 - 16:00<br />
                        Pazar: Kapalı
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İletişim</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Canlı Destek
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Bizi Arayın
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta Gönderin
                  </Button>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Instagram className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-3">
                    Sosyal medya hesaplarımızdan güncel haberlerimizi takip edin.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                    Sıkça Sorulan Sorular
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                    Merak ettiklerinizin cevapları burada olabilir.
                  </p>
                  <Button variant="outline" size="sm">
                    SSS'yi İncele
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ofisimizi Ziyaret Edin
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              İstanbul Maslak'taki ofisimizde sizleri ağırlamaktan mutluluk duyarız.
            </p>
          </div>
          
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">
                Harita entegrasyonu burada yer alacak
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}