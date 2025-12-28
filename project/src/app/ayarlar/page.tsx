"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  Lock, 
  ShieldCheck, 
  Trash2,
  Save,
  Loader2,
  ChevronRight,
  User as UserIcon,
  Sparkles,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { usersApi, uploadApi, settingsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// Custom Noise Texture Component
const Noise = () => (
  <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]" 
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
  />
);

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    profession: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    specializations: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        company_name: user.company_name || "",
        profession: user.profession || "",
        phone: user.phone || "",
        location: user.location || "",
        website: user.website || "",
        bio: user.bio || "",
        specializations: user.specializations || ""
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await usersApi.updateProfile(formData);
      if (response.success) {
        showSuccess("Profil başarıyla güncellendi.");
        await refreshUser();
      } else {
        showError(response.error || "Güncelleme sırasında bir hata oluştu.");
      }
    } catch (error) {
      showError("Sistemde bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoLoading(true);
    try {
      const response = await usersApi.updateProfileImage(file);
      if (response.success) {
        showSuccess("Profil fotoğrafı güncellendi.");
        await refreshUser();
      } else {
        showError(response.error || "Fotoğraf yüklenemedi.");
      }
    } catch (error) {
      showError("Fotoğraf yükleme hatası.");
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Şifreler uyuşmuyor.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await settingsApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (response.success) {
        showSuccess("Şifre başarıyla değiştirildi.");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showError(response.error || "Şifre değiştirilemedi.");
      }
    } catch (error) {
      showError("Şifre güncelleme hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-blue-500 selection:text-white pb-32">
      <Noise />
      
      {/* Avant-Garde Hero */}
      <div className="pt-32 pb-12 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div className="flex items-center gap-4 mb-6">
               <Badge className="bg-blue-600 text-white border-none py-1.5 px-4 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">CONTROL PANEL</Badge>
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">AYARLAR VE KİMLİK</h2>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
              IDENTITY<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-200 dark:from-white dark:via-blue-400 dark:to-slate-800">PREFERENCES.</span>
            </h1>
          </motion.div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <main className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Dashboard Style Info Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
             <div className="relative group p-1 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5 rounded-[3rem] overflow-hidden">
                <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.9rem] p-10 relative z-10">
                   <div className="relative mb-8 flex justify-center">
                      <div className="relative w-40 h-40">
                         <Avatar className="w-full h-full border-4 border-white dark:border-black shadow-2xl rounded-full overflow-hidden">
                           <AvatarImage src={user.profile_image_url || user.avatar_url} className="object-cover" />
                           <AvatarFallback className="bg-black text-white text-4xl font-black italic">{user.first_name?.[0]}</AvatarFallback>
                         </Avatar>
                         {isPhotoLoading && (
                           <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                           </div>
                         )}
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="absolute bottom-1 right-1 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all border-4 border-white dark:border-black cursor-pointer shadow-xl z-20"
                         >
                           <Camera className="w-5 h-5" />
                         </button>
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           onChange={handlePhotoUpload} 
                           className="hidden" 
                           accept="image/*" 
                         />
                      </div>
                   </div>
                   <div className="text-center">
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{user.first_name} {user.last_name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{user.user_type === 'company' ? 'Architectural Studio' : 'Professional Architect'}</p>
                   </div>
                </div>
                <Noise />
             </div>

             <div className="space-y-6">
                {[
                  { label: "Hesap Durumu", val: user.is_verified ? "Doğrulandı" : "Onay Bekliyor", icon: ShieldCheck, color: "text-green-500" },
                  { label: "Abonelik", val: user.subscription_type?.toUpperCase() || "STANDART", icon: Zap, color: "text-blue-500" },
                  { label: "Kayıt Tarihi", val: new Date(user.created_at).toLocaleDateString('tr-TR'), icon: UserIcon, color: "text-slate-400" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-2xl">
                     <div className="flex items-center gap-4">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest">{item.val}</span>
                  </div>
                ))}
             </div>
          </aside>

          {/* Main Settings Form */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* General Info */}
            <section>
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-black italic">01</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">Genel Profil Bilgileri</h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">AD</label>
                  <Input 
                    id="first_name" 
                    value={formData.first_name} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">SOYAD</label>
                  <Input 
                    id="last_name" 
                    value={formData.last_name} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                {user.user_type === 'company' && (
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="company_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">FİRMA ADI</label>
                    <Input 
                      id="company_name" 
                      value={formData.company_name} 
                      onChange={handleInputChange} 
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="profession" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">MESLEK / ÜNVAN</label>
                  <Input 
                    id="profession" 
                    value={formData.profession} 
                    onChange={handleInputChange} 
                    placeholder="Örn: İç Mimar, Restorasyon Uzmanı"
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">TELEFON</label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">KONUM (ŞEHİR)</label>
                  <Input 
                    id="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="website" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WEBSITE URL</label>
                  <Input 
                    id="website" 
                    value={formData.website} 
                    onChange={handleInputChange} 
                    placeholder="https://www.example.com"
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="specializations" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">UZMANLIK ALANLARI (VİRGÜLLE AYIRIN)</label>
                  <Input 
                    id="specializations" 
                    value={formData.specializations} 
                    onChange={handleInputChange} 
                    placeholder="Villa Tasarımı, Restorasyon, İç Mimari..."
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">HAKKIMDA / MANİFESTO</label>
                  <textarea 
                    id="bio" 
                    value={formData.bio} 
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6 py-4 resize-none outline-none" 
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                   <Button 
                     type="submit" 
                     disabled={isLoading}
                     className="bg-blue-600 hover:bg-black dark:hover:bg-white text-white dark:hover:text-black h-16 px-12 rounded-full font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50"
                   >
                     {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "GÜNCELLEMELERİ KAYDET"}
                   </Button>
                </div>
              </form>
            </section>

            {/* Password Change */}
            <section className="pt-16 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-black italic">02</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">Güvenlik & Şifre</h2>
              </div>

              <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">MEVCUT ŞİFRE</label>
                    <Input 
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">YENİ ŞİFRE</label>
                    <Input 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">YENİ ŞİFRE (TEKRAR)</label>
                    <Input 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-blue-600 font-bold px-6" 
                    />
                 </div>
                 <div className="md:col-span-2 flex justify-end">
                    <Button 
                      type="submit" 
                      variant="outline"
                      disabled={isLoading}
                      className="h-14 border-2 border-slate-200 dark:border-white/10 rounded-full font-black uppercase tracking-widest px-10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    >
                      ŞİFREYİ GÜNCELLE
                    </Button>
                 </div>
              </form>
            </section>

            {/* Account Management */}
            <section className="pt-16 border-t border-slate-100 dark:border-white/5">
               <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <Trash2 className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-1">Hesabı Kalıcı Olarak Sil</h3>
                        <p className="text-xs font-bold text-red-500/60 uppercase tracking-widest leading-relaxed max-w-sm">Bu işlem geri alınamaz. Tüm verileriniz, projeleriniz ve profiliniz kalıcı olarak silinecektir.</p>
                     </div>
                  </div>
                  <Button variant="destructive" className="h-14 px-10 rounded-full font-black uppercase tracking-widest">HESABI YOK ET</Button>
               </div>
            </section>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
