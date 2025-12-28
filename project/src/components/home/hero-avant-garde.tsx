"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ArrowDownRight, Sparkles, Building2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

const Noise = () => (
  <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]" 
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
  />
);

export function HeroAvantGarde() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[110vh] bg-white dark:bg-[#050505] overflow-hidden flex items-center pt-20">
      <Noise />
      
      {/* Background Architectural Mesh */}
      <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" className="scale-150">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-8">
                <Badge className="bg-black dark:bg-white text-white dark:text-black border-none py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                  LEVEL 01
                </Badge>
                <div className="h-[1px] w-20 bg-slate-200 dark:bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">ARCHITECTURAL EVOLUTION</span>
              </div>

              <h1 className="text-[12vw] lg:text-[10vw] font-black italic tracking-tighter uppercase leading-[0.75] mb-12 select-none">
                <motion.span 
                  className="block"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Beyond
                </motion.span>
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-200 dark:from-white dark:via-blue-400 dark:to-slate-800"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Structure.
                </motion.span>
              </h1>

              <motion.p 
                className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-tight mb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                Yeni nesil mimari ekosistem. Türkiye'nin en seçkin mimarları ve projeleri tek bir akışta buluşuyor. Estetik, fonksiyon ve vizyonun kesişim noktası.
              </motion.p>

              {/* Advanced Search Bar */}
              <motion.div 
                className="relative max-w-3xl group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-4 p-3 bg-white dark:bg-[#0c0c0c] rounded-[2.3rem] border border-slate-100 dark:border-white/5 shadow-2xl">
                  <div className="flex-1 w-full pl-6 flex items-center gap-4">
                    <Search className="w-6 h-6 text-slate-400" />
                    <Input 
                      placeholder="Proje, mimar veya stil keşfet..."
                      className="border-none bg-transparent focus-visible:ring-0 text-lg font-bold h-14"
                    />
                  </div>
                  <Button className="w-full md:w-auto h-14 px-10 rounded-[1.8rem] bg-blue-600 hover:bg-black dark:hover:bg-white text-white dark:hover:text-black font-black uppercase tracking-widest transition-all">
                    KEŞFETMEYE BAŞLA
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Abstract Visual Elements */}
          <div className="lg:col-span-4 relative hidden lg:block">
            <motion.div 
              style={{ y: y1 }}
              className="absolute -top-40 right-0 w-80 h-[500px] bg-slate-100 dark:bg-white/5 rounded-[4rem] overflow-hidden border border-slate-200 dark:border-white/10"
            >
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />
               <img 
                 src="https://images.unsplash.com/photo-1487958444681-a420132449a7?q=80&w=2070&auto=format&fit=crop" 
                 alt="Architecture" 
                 className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 transition-all duration-1000"
               />
            </motion.div>
            
            <motion.div 
              style={{ y: y2 }}
              className="absolute top-20 -right-20 w-64 h-[400px] bg-blue-600 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,99,235,0.3)] z-20 flex flex-col justify-end p-8"
            >
               <Zap className="w-12 h-12 text-white mb-4" />
               <h3 className="text-white text-2xl font-black uppercase leading-none italic mb-2">Avant<br/>Garde</h3>
               <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Architectural Registry</p>
            </motion.div>

            <div className="absolute top-[450px] -right-10 flex flex-col gap-4">
               {[Building2, Users, Sparkles].map((Icon, i) => (
                 <motion.div
                   key={i}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ delay: 1 + (i * 0.1) }}
                   className="w-16 h-16 bg-white dark:bg-[#0c0c0c] rounded-full border border-slate-100 dark:border-white/5 shadow-xl flex items-center justify-center"
                 >
                   <Icon className="w-6 h-6 text-blue-600" />
                 </motion.div>
               ))}
            </div>
          </div>

        </div>
      </div>

      {/* Aesthetic Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-20 bg-gradient-to-b from-blue-600 to-transparent" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 rotate-90 origin-left mt-10">SCROLL</span>
      </motion.div>
    </section>
  );
}
