import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  Globe,
  Award,
  Users,
  Briefcase,
  CheckCircle,
  Heart,
  Share2,
  Eye,
  Download
} from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Mimar Profili - Mimariproje.com",
  description: "Profesyonel mimar profili ve portföy bilgileri.",
};

import { usersApi } from "@/lib/api";
import type { User } from "@/lib/api";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function ArchitectProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const response = await usersApi.getUser(Number(params.id));
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          setError("Kullanıcı bulunamadı");
        }
      } catch (err) {
        setError("Bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadUser();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Hata</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <Image
          src={user.profile_image_url || "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200"} // Fallback cover
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Profile Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={user.profile_image_url} />
                      <AvatarFallback>{user.first_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {user.full_name}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {user.profession || "Mimar"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {user.company_name}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.location || "Belirtilmemiş"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date().getFullYear() - new Date(user.created_at).getFullYear() + 1} yıl deneyim
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="ml-2 font-semibold text-slate-900 dark:text-white">
                      {user.rating || 0}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    0 değerlendirme
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      0
                    </div>
                    <div className="text-xs text-slate-500">Tamamlanan Proje</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      2 saat
                    </div>
                    <div className="text-xs text-slate-500">Yanıt Süresi</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Ara
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      E-posta
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone || "Belirtilmemiş"}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Globe className="h-4 w-4 mr-2" />
                    Web sitesi yok
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Specialties */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Uzmanlık Alanları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Özel Alanlar</h4>
                    <div className="flex flex-wrap gap-2">
                      {/* Mock specialties for now */}
                      <Badge variant="outline">Villa Tasarımı</Badge>
                      <Badge variant="outline">Modern Mimari</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Yazılım Becerileri</h4>
                    <div className="flex flex-wrap gap-2">
                      {/* Mock skills for now */}
                      <Badge className="bg-primary/10 text-primary">AutoCAD</Badge>
                      <Badge className="bg-primary/10 text-primary">Revit</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Diller</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Türkçe</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>Hakkında</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {user.bio || "Henüz biyografi eklenmemiş."}
                </p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Eğitim
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">Belirtilmemiş</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sertifikalar
                    </h4>
                    <div className="space-y-1">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          • Belirtilmemiş
                        </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Portföy</CardTitle>
                  <Button variant="outline" size="sm">
                    Tümünü Gör
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <p className="text-slate-500 col-span-2 text-center py-8">Henüz proje eklenmemiş.</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Müşteri Yorumları</CardTitle>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{user.rating || 0}</span>
                    <span className="text-slate-500">(0)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-slate-500 text-center py-8">Henüz değerlendirme yapılmamış.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}