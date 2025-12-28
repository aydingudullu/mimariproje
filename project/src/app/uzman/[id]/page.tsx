"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  ArrowUpRight,
  ShieldCheck,
  ChevronLeft,
  Heart,
  Briefcase,
  Globe,
  Award,
  Calendar,
  Layers,
  Zap,
  Phone,
  Mail,
  Share2,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { usersApi, User } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Custom Noise Texture Component
const Noise = () => (
  <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]" 
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
  />
);

export default function ExpertDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [expert, setExpert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useToast();

  const fetchExpert = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      
      const response = await usersApi.getPublicProfile(Number(id));
      
      if (response.success && response.data) {
        const rData = response.data as any;
        const userData = rData.user || rData.data || rData;
        
        // Ensure name fallbacks
        if (!userData.first_name && userData.company_name) {
          const parts = userData.company_name.split(" ");
          userData.first_name = parts[0];
          userData.last_name = parts.slice(1).join(" ");
        }
        
        setExpert(userData);
      } else {
        showError("Uzman bulunamadı.");
        router.push("/uzmanlar");
      }
    } catch (error) {
      showError("Sistemde bir hata oluştu.");
      router.push("/uzmanlar");
    } finally {
      setIsLoading(false);
    }
  }, [id, showError, router]);

  useEffect(() => {
    fetchExpert();
  }, [fetchExpert]);

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
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Loading Talent</span>
        </motion.div>
      </div>
    );
  }

  if (!expert) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white pb-32">
      <Noise />
      
      {/* Avant-Garde Header / Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-0 hover:bg-transparent"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Geri Dön</span>
          </Button>

          <div className="flex items-center gap-6">
             <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">
               <Heart className="w-4 h-4" /> Favori
             </button>
             <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors">
               <Share2 className="w-4 h-4" /> Paylaş
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Profile Section */}
      <header className="relative pt-20 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Identity */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
              >
                <div className="flex items-center gap-4 mb-8">
                   <Badge className="bg-blue-600 text-white border-none text-[8px] font-black tracking-[0.2em] py-1.5 px-4 rounded-full">
                     {expert.user_type === 'company' ? 'STUDIO' : 'ARCHITECT'}
                   </Badge>
                   {expert.is_verified && (
                     <div className="flex items-center gap-1.5 text-green-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Expert</span>
                     </div>
                   )}
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-8 italic uppercase break-words">
                  {expert.first_name}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-200 dark:from-white dark:via-blue-400 dark:to-slate-800">
                    {expert.last_name || expert.company_name}
                  </span>
                </h1>

                <div className="flex flex-wrap gap-x-12 gap-y-6 mt-12 border-l-[1px] border-slate-200 dark:border-white/10 pl-8">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Konum</span>
                     <span className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
                        <MapPin className="w-4 h-4 text-blue-500" /> {expert.location || "Antarctic (Remote)"}
                     </span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deneyim</span>
                     <span className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
                        <Calendar className="w-4 h-4 text-blue-500" /> {expert.experience_years || 5}+ Year
                     </span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Değerlendirme</span>
                     <div className="flex items-center gap-1.5 text-lg font-bold">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" /> 
                        <span>4.9</span>
                        <span className="text-xs font-medium text-slate-400">(42 Reviews)</span>
                     </div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Visual Avatar Card */}
            <div className="lg:col-span-4 flex justify-end">
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                 animate={{ opacity: 1, scale: 1, rotate: 0 }}
                 transition={{ delay: 0.2, duration: 1, ease: "circOut" }}
                 className="relative w-full max-w-sm aspect-[4/5] bg-slate-100 dark:bg-[#0c0c0c] rounded-[3rem] overflow-hidden group shadow-2xl"
               >
                 <Avatar className="h-full w-full rounded-none">
                   <AvatarImage src={expert.profile_image_url || expert.avatar_url} className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                   <AvatarFallback className="bg-black text-white text-9xl font-black italic">{expert.first_name?.[0]}</AvatarFallback>
                 </Avatar>
                 {/* Bauhaus Overlay */}
                 <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
                    <button className="w-full bg-white text-black py-4 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:gap-6 transition-all hover:bg-blue-600 hover:text-white border-none shadow-xl">
                       Mesaj Gönder <MessageCircle className="w-5 h-5" />
                    </button>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Brutalist Background Detail */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 dark:bg-white/5 -z-10 rotate-1"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>
      </header>

      {/* Main Content Grid */}
      <main className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* Sidebar Info */}
          <aside className="lg:col-span-4 space-y-16">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-400"></span> Bio / Manifesto
              </h3>
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                {expert.bio || "Mimariyi sadece bir yapı olarak değil, bir yaşam felsefesi olarak görüyoruz. Estetikle sürdürülebilirliği birleştiren, kullanıcı odaklı ve gelecek vizyonuna sahip projeler üretiyoruz. Modernizmin brutalist sınırlarını zorlamayı seviyoruz."}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-400"></span> Yetkinlikler
              </h3>
              <div className="flex flex-wrap gap-2">
                {(expert.specializations || "Konut Tasarımı, Restorasyon, İç Mimari, Sürdürülebilir Yapılar, Endüstriyel Tasarım").split(",").map((s: string) => (
                  <Badge key={s} variant="outline" className="border-slate-200 dark:border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-colors cursor-default">
                    {s.trim()}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="p-8 bg-slate-50 dark:bg-[#0c0c0c] rounded-[2rem] border border-slate-100 dark:border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8">İletişim & Linkler</h3>
              <div className="space-y-6">
                <a href={expert.website || "#"} target="_blank" className="flex items-center justify-between group">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-500" /> Website
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </a>
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-500" /> E-posta
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-green-500 transition-colors"></div>
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-500" /> Telefon
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-green-500 transition-colors"></div>
                </div>
              </div>
            </section>
          </aside>

          {/* Portfolio Grid */}
          <div className="lg:col-span-8">
            <div className="flex items-end justify-between mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">Curation</h2>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seçkin Projeler ({expert.projects?.length || 0})</span>
                </div>
              </div>
              
              <div className="hidden sm:flex gap-4">
                 <button className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest">TÜM PROJELER</button>
              </div>
            </div>

            {expert.projects && expert.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {expert.projects.map((project: any, index: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/proje/${project.id}`}>
                      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-[#111] rounded-[2rem] overflow-hidden mb-6">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all z-10" />
                        <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                           <div className="p-3 bg-white text-black rounded-full">
                              <ArrowUpRight className="w-5 h-5" />
                           </div>
                        </div>
                        {/* Placeholder for project image as we don't have images in the reduced project object usually */}
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-10 font-black italic">
                           ARCHI PRO.
                        </div>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight mb-1 group-hover:text-blue-500 transition-colors">{project.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.category || "Mimari Proje"}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
                 <Layers className="w-12 h-12 text-slate-200 mb-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Henüz Proje Eklenmemiş</span>
              </div>
            )}
            
            {/* Extended Section for Achievements or Stats */}
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { label: "Müşteri Memnuniyeti", value: "%98", icon: Heart },
                 { label: "Tamamlanan Proje", value: "24+", icon: Zap },
                 { label: "Mimari Ödül", value: "3", icon: Award },
                 { label: "Aktif Proje", value: "11", icon: Briefcase }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-[#0c0c0c] rounded-[2rem]">
                   <stat.icon className="w-5 h-5 text-blue-500 mb-4" />
                   <div className="text-2xl font-black italic leading-none mb-1">{stat.value}</div>
                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </main>

      {/* Call to Action: Project Launch */}
      <section className="container mx-auto px-6 mt-24">
         <div className="relative p-12 lg:p-24 bg-blue-600 rounded-[4rem] text-white flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="grid-white" width="10" height="10" patternUnits="userSpaceOnUse">
                     <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#grid-white)" />
               </svg>
            </div>
            
            <h2 className="text-4xl md:text-7xl font-black italic uppercase leading-[0.9] mb-12 tracking-tighter relative z-10">
              HAYALİNİZİ<br />BİRLİKTE<br /><span className="text-black">İNŞA EDELİM.</span>
            </h2>
            
            <p className="max-w-xl text-lg font-medium opacity-80 mb-12 relative z-10 leading-relaxed">
              Bu uzmanın vizyonu projenize uygun mu? Hemen bir ön görüşme planlayarak iş birliğine ilk adımı atın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
               <Button className="h-20 px-12 bg-white text-blue-600 hover:bg-black hover:text-white rounded-full font-black uppercase tracking-widest border-none shadow-2xl transition-all">
                  İŞ BİRLİĞİ TALEBİ
               </Button>
               <Button variant="outline" className="h-20 px-12 bg-transparent text-white border-2 border-white/20 hover:bg-white/10 rounded-full font-black uppercase tracking-widest transition-all">
                  MESAJ GÖNDER
               </Button>
            </div>
         </div>
      </section>

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
