"use client";

import { useEffect, useState } from "react";
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  ArrowUpRight,
  ShieldCheck,
  Heart,
  Briefcase,
  Globe,
  Award,
  Zap,
  Mail,
  Phone,
  Settings,
  Plus,
  LayoutGrid,
  Share2,
  ExternalLink,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Custom Noise Texture Component
const Noise = () => (
  <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]" 
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
  />
);

export default function MyProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-24 h-24 border-2 border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Synchronizing Identity</span>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-3xl font-black mb-4">ERİŞİM KISITLI</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Profilinizi görüntülemek için lütfen giriş yapın.</p>
        <Link href="/auth/login">
          <Button className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest px-8 h-14 rounded-full">
            GİRİŞ YAP
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white pb-32">
      <Noise />
      
      {/* Avant-Garde Profile Header */}
      <header className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Identity Focus */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
              >
                <div className="flex items-center gap-4 mb-8">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AKTİF PROFİL</span>
                   </div>
                   <Badge className="bg-slate-900 dark:bg-white text-white dark:text-black border-none text-[8px] font-black tracking-[0.2em] py-1.5 px-4 rounded-full">
                     {user.user_type === 'company' ? 'GLOBAL STUDIO' : 'PROFESSIONAL ARCHITECT'}
                   </Badge>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-8 italic uppercase break-words">
                  {user.first_name || "MİMAR"}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-200 dark:from-white dark:via-blue-400 dark:to-slate-800">
                    {user.last_name || user.company_name || "PROFİLİ"}
                  </span>
                </h1>

                <div className="flex flex-wrap gap-x-12 gap-y-6 mt-12 border-l-[1px] border-slate-200 dark:border-white/10 pl-8">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Konum</span>
                     <span className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
                        <MapPin className="w-4 h-4 text-blue-500" /> {user.location || "Ayarlanmadı"}
                     </span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hesap Türü</span>
                     <span className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
                        <ShieldCheck className="w-4 h-4 text-blue-500" /> {user.subscription_type || "Standart"}
                     </span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Müşteri Puanı</span>
                     <div className="flex items-center gap-1.5 text-lg font-bold">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" /> 
                        <span>{user.rating || "5.0"}</span>
                     </div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Modern Avatar & Quick Actions */}
            <div className="lg:col-span-4 flex flex-col items-end gap-8">
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                 animate={{ opacity: 1, scale: 1, rotate: 0 }}
                 transition={{ delay: 0.2, duration: 1, ease: "circOut" }}
                 className="relative w-full max-w-[280px] aspect-square bg-slate-100 dark:bg-[#0c0c0c] rounded-[3rem] overflow-hidden group shadow-2xl"
               >
                 <Avatar className="h-full w-full rounded-none">
                   <AvatarImage src={user.profile_image_url || user.avatar_url} className="object-cover" />
                   <AvatarFallback className="bg-black text-white text-7xl font-black italic">
                      {user.first_name?.[0] || user.email[0].toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
                 <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href="/ayarlar">
                      <Button variant="secondary" className="w-full rounded-2xl font-black uppercase tracking-widest py-6">
                        FOTOĞRAFI DEĞİŞTİR
                      </Button>
                    </Link>
                 </div>
               </motion.div>

               <div className="flex flex-col gap-4 w-full max-w-[280px]">
                  <Link href="/ayarlar" className="w-full">
                    <Button className="w-full h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:gap-6 transition-all shadow-xl">
                       PROFİLİ DÜZENLE <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-4">
                     <Button variant="outline" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px]">
                        PAYLAŞ <Share2 className="w-3.5 h-3.5 ml-2" />
                     </Button>
                     <Button variant="outline" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px]">
                        PREMIUM <Zap className="w-3.5 h-3.5 ml-2 text-yellow-500" />
                     </Button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Floating Detail Section BG Decor */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 dark:bg-white/5 -z-10 rotate-2"></div>
      </header>

      {/* Profile Sections Grid */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Info Area */}
          <div className="lg:col-span-4 space-y-16">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-400"></span> Hakkımda / Manifesto
              </h3>
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic">
                {user.bio || "Hayallerinizi ve projelerinizi burada sergileyin. Henüz bir biyografi eklemediniz. Kendinizden, vizyonunuzdan ve mimari yaklaşımınızdan bahsedin."}
              </p>
              {!user.bio && (
                <Link href="/ayarlar" className="inline-block mt-6">
                  <span className="text-blue-600 font-black text-xs uppercase tracking-widest border-b-[1px] border-blue-600 pb-1 cursor-pointer hover:text-blue-500 hover:border-blue-500">BİYO EKLE +</span>
                </Link>
              )}
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-400"></span> Uzmanlıklar
              </h3>
              <div className="flex flex-wrap gap-2">
                 {(user.specializations || "Genel Mimari, Modern Tasarım").split(',').map((s: string) => (
                   <Badge key={s} variant="outline" className="border-slate-200 dark:border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                     {s.trim()}
                   </Badge>
                 ))}
                 <Link href="/ayarlar">
                    <Badge variant="outline" className="border-dashed border-slate-300 dark:border-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                      YENİ EKLE +
                    </Badge>
                 </Link>
              </div>
            </section>

            <section className="p-8 bg-slate-50 dark:bg-[#0c0c0c] rounded-[2.5rem] border border-slate-100 dark:border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8">Erişim & İletişim</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-500" /> E-POSTA
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 lowercase">{user.email}</span>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-500" /> TELEFON
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{user.phone || "Ayarlanmadı"}</span>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-500" /> WEBSITE
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{user.website || "Ekle+"}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Portfolio & Activity Area */}
          <div className="lg:col-span-8">
            <div className="flex items-end justify-between mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">Kürasyon</h2>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">YAYINLANAN PROJELER</span>
                </div>
              </div>
              
              <Link href="/is-ilani-ver">
                <Button className="rounded-full h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Plus className="w-4 h-4" /> YENİ PROJE YÜKLE
                </Button>
              </Link>
            </div>

            {/* Empty State for Projects */}
            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] bg-slate-50/50 dark:bg-transparent">
               <div className="p-6 bg-white dark:bg-[#0c0c0c] rounded-full shadow-2xl mb-8">
                 <LayoutGrid className="w-12 h-12 text-slate-200" />
               </div>
               <h3 className="text-xl font-black uppercase tracking-widest mb-2">Henüz Projeniz Yok</h3>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-10 max-w-xs text-center leading-relaxed">
                 Portföyünüzü oluşturun ve potansiyel müşteriler tarafından keşfedilin.
               </p>
               <Button variant="outline" className="border-2 border-slate-900 dark:border-white rounded-full px-10 font-black h-14">
                  PROJE OLUŞTUR
               </Button>
            </div>

            {/* Activity Stats for the owner */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-10 bg-black text-white rounded-[2.5rem] relative overflow-hidden group">
                  <Briefcase className="w-12 h-12 absolute -top-4 -right-4 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                  <div className="text-4xl font-black italic mb-1">0</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">TAMAMLANAN İŞLER</div>
               </div>
               <div className="p-10 bg-slate-50 dark:bg-[#0c0c0c] rounded-[2.5rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                  <Star className="w-12 h-12 absolute -top-4 -right-4 opacity-5 group-hover:scale-125 transition-transform duration-700" />
                  <div className="text-4xl font-black italic mb-1">0%</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">BAŞARI ORANI</div>
               </div>
               <div className="p-10 bg-slate-50 dark:bg-[#0c0c0c] rounded-[2.5rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                  <UserIcon className="w-12 h-12 absolute -top-4 -right-4 opacity-5 group-hover:scale-125 transition-transform duration-700" />
                  <div className="text-4xl font-black italic mb-1">0</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">PROFİL GÖRÜNTÜLENME</div>
               </div>
            </div>
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
