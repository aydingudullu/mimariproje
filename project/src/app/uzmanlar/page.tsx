"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  MessageCircle, 
  ArrowUpRight,
  Filter,
  X,
  Sparkles,
  Command,
  LayoutGrid,
  Zap,
  ShieldCheck,
  MoreHorizontal,
  ChevronRight,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function ExpertsPage() {
  const [experts, setExperts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { showError } = useToast();

  const fetchExperts = useCallback(async (query = "", type = "", location = "") => {
    try {
      setIsLoading(true);
      const response = await usersApi.searchUsers({
        query: query || undefined,
        user_type: type || undefined,
        location: location || undefined,
        limit: 12,
        page: 1
      });

      if (response.success && response.data) {
        const actualData = (response.data as any).data || response.data;
        setExperts(actualData.users || []);
        setTotalCount(actualData.pagination?.total || 0);
      } else {
        setExperts([]);
      }
    } catch (error) {
      showError("Sistemde bir hata oluştu.");
      setExperts([]);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExperts(searchQuery, selectedUserType, selectedLocation);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedUserType, selectedLocation, fetchExperts]);

  const categories = [
    { label: "Hepsi", value: "" },
    { label: "Mimarlar", value: "individual" },
    { label: "Ofisler", value: "company" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      <Noise />
      
      {/* Avant-Garde Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-[1px] w-12 bg-blue-600"></span>
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Directory d'élite</span>
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-8 italic">
                  ARCHI<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-200 dark:from-white dark:via-blue-400 dark:to-slate-800">EXPERTS.</span>
                </h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed"
              >
                Yeni nesil mimari projeleriniz için Türkiye'nin en vizyoner tasarımcılarını ve ofislerini seçkin bir kürasyonla keşfedin.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="hidden lg:block relative"
            >
              <div className="w-48 h-48 border-[1px] border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center animate-spin-slow">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-full h-[1px] bg-slate-100 dark:bg-white/5 rotate-45"></div>
                   <div className="w-full h-[1px] bg-slate-100 dark:bg-white/5 -rotate-45"></div>
                </div>
                <span className="bg-white dark:bg-[#050505] px-4 py-2 text-[10px] font-black tracking-widest uppercase relative z-10 border border-slate-200 dark:border-white/10">
                  EST. 2024
                </span>
              </div>
            </motion.div>
          </div>

          {/* High-Concept Search & Filter Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-3xl">
            <div className="lg:col-span-5 bg-white dark:bg-[#0c0c0c] p-6 flex items-center group">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors mr-4" />
              <input 
                type="text" 
                placeholder="YETENEK ARA..."
                className="w-full bg-transparent border-none outline-none font-black tracking-widest placeholder:text-slate-300 dark:placeholder:text-white/10 uppercase"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="lg:col-span-3 bg-white dark:bg-[#0c0c0c] p-6 border-l border-slate-200 dark:border-white/10 flex items-center">
              <Command className="w-5 h-5 text-slate-400 mr-4" />
              <select 
                className="w-full bg-transparent border-none outline-none font-bold text-sm tracking-wide uppercase cursor-pointer"
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="lg:col-span-3 bg-white dark:bg-[#0c0c0c] p-6 border-l border-slate-200 dark:border-white/10 flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 mr-4" />
              <select 
                className="w-full bg-transparent border-none outline-none font-bold text-sm tracking-wide uppercase cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">TÜM ŞEHİRLER</option>
                {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"].map(city => (
                  <option key={city} value={city}>{city.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1 bg-black dark:bg-white p-6 flex items-center justify-center cursor-pointer group hover:bg-blue-600 dark:hover:bg-blue-500 transition-all">
              <ArrowUpRight className="w-6 h-6 text-white dark:text-black group-hover:rotate-45 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="container mx-auto px-6 pb-32">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-xs font-black uppercase tracking-widest">{totalCount} AKTİF PROFİL</span>
             </div>
             <div className="hidden sm:flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DOĞRULANMIŞ PLATFORM</span>
             </div>
           </div>
           
           <div className="flex items-center gap-4 mt-6 md:mt-0">
             <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
               <LayoutGrid className="w-4 h-4" />
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:border-blue-500 transition-all">
               <Filter className="w-3 h-3" /> SIRALA
             </button>
           </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/5] bg-slate-50 dark:bg-[#0c0c0c] rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            <AnimatePresence mode="popLayout">
              {experts?.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.8, ease: "circOut" }}
                  className="group relative"
                >
                  {/* Avant-Garde Expert Card */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 transition-all duration-700 group-hover:rounded-[1.5rem] group-hover:border-blue-500/50">
                    
                    {/* Background Visual Detail */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Content Layer */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start">
                        <Avatar className="h-16 w-16 border-2 border-white dark:border-white/10 shadow-2xl rounded-2xl group-hover:scale-110 transition-transform duration-500">
                          <AvatarImage src={expert.profile_image_url || undefined} />
                          <AvatarFallback className="bg-black text-white font-black text-xl italic">{expert.first_name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col items-end gap-2">
                           {expert.is_verified && (
                             <Badge className="bg-white/80 dark:bg-black/50 backdrop-blur-md text-[#000] dark:text-white border-none text-[8px] font-black tracking-widest uppercase py-1 px-3">
                               VERIFIED
                             </Badge>
                           )}
                           <button className="p-2 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 transition-all">
                             <Heart className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-yellow-500 mb-3">
                           {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-current" />)}
                           <span className="text-[10px] font-black text-slate-400 ml-1">4.9+</span>
                        </div>
                        <h3 className="text-2xl font-black leading-tight tracking-tight mb-2 uppercase break-words">
                          {expert.first_name} <br />
                          {expert.last_name || expert.company_name}
                        </h3>
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-6">
                           {expert.profession || "Arch. Specialist"}
                        </p>
                        
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 tracking-wider">
                           <div className="flex items-center gap-1">
                             <MapPin className="w-3 h-3" /> {expert.location?.toUpperCase() || "INTL."}
                           </div>
                           <div className="flex items-center gap-1">
                             <Zap className="w-3 h-3" /> {expert.experience_years || 5}+ YRS
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay Button */}
                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo z-20">
                       <Link href={`/${expert.user_type === 'company' ? 'firma' : 'uzman'}/${expert.id}`} className="block w-full">
                         <button className="w-full bg-black dark:bg-white py-4 rounded-xl text-white dark:text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:gap-6 transition-all">
                            PORTFOLIO <ChevronRight className="w-4 h-4" />
                         </button>
                       </Link>
                    </div>
                    
                    {/* Brutalist Diagonal Detail */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-600 rotate-45 translate-x-12 translate-y-12 opacity-10 group-hover:opacity-100 group-hover:translate-x-10 group-hover:translate-y-10 transition-all duration-700 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && experts.length === 0 && (
          <div className="py-40 flex flex-col items-center justify-center text-center opacity-40">
             <LayoutGrid className="w-12 h-12 mb-6" />
             <h3 className="text-2xl font-black uppercase tracking-widest">Minimal Data Available</h3>
             <p className="text-sm font-bold mt-4 uppercase tracking-widest">Filtreleri veya Terimleri Güncelleyin</p>
          </div>
        )}
      </section>

      {/* Avant-Garde CTA */}
      <section className="container mx-auto px-6 py-20">
         <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                     <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#grid)" />
               </svg>
            </div>
            
            <div className="relative z-10 max-w-xl text-center lg:text-left">
               <h2 className="text-4xl md:text-6xl font-black text-white dark:text-black leading-[0.9] mb-8 uppercase italic">
                 SİZ DE <br /> <span className="text-blue-500">SEÇKİNLER</span> <br /> ARASINDA OLUN.
               </h2>
               <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm leading-relaxed">
                 Portföyünüzü binlerce potansiyel müşteri ve ortağa sergilemek için profesyonel ağımıza katılın.
               </p>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} className="relative z-10">
               <Button size="lg" className="h-20 px-12 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full font-black uppercase tracking-[0.2em] shadow-2xl">
                 KATILIM TALEBİ GÖNDER
               </Button>
            </motion.div>
         </div>
      </section>

      {/* Minimalistic Footer Decoration */}
      <footer className="py-20 border-t border-slate-100 dark:border-white/5">
         <div className="container mx-auto px-6 flex flex-col items-center gap-10">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 text-center">
               DESIGNED FOR ARCHITECTURAL EXCELLENCE // MIMARIPROJE 2024
            </div>
            <div className="flex gap-8 opacity-40">
               <Link href="/" className="text-[10px] font-black hover:opacity-100">HOME</Link>
               <Link href="/projeler" className="text-[10px] font-black hover:opacity-100">PROJECTS</Link>
               <Link href="/about" className="text-[10px] font-black hover:opacity-100">MANIFESTO</Link>
            </div>
         </div>
      </footer>
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .ease-expo {
          transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
        }
      `}</style>
    </div>
  );
}