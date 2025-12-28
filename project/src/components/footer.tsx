"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Instagram, Linkedin, Twitter, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Noise = () => (
  <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none z-[1]" 
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
  />
);

export function Footer() {
  return (
    <footer className="relative bg-[#050505] text-white pt-32 pb-12 overflow-hidden">
      <Noise />
      
      {/* Background Decorative Typography */}
      <div className="absolute top-0 right-0 text-[25vw] font-black italic uppercase leading-none text-white/[0.02] select-none pointer-events-none">
        MP.
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-10 group">
                <Building2 className="h-10 w-10 text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
                <span className="text-3xl font-black italic uppercase tracking-tighter">
                  Mimari<span className="text-blue-600">proje</span>
                </span>
              </Link>
              <h3 className="text-4xl md:text-5xl font-black italic uppercase leading-[0.9] tracking-tighter mb-8 max-w-sm">
                Tasarımın <br/>Geleceğini <br/><span className="text-blue-600">Keşfedin.</span>
              </h3>
            </div>
            
            <div className="space-y-6">
               <div className="flex gap-4">
                  {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                    <Link key={i} href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                       <Icon className="w-5 h-5" />
                    </Link>
                  ))}
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                  © 2025 MIMARIPROJE REGISTRY. ALL RIGHTS RESERVED.
               </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               
               {/* Platform Links */}
               <div className="space-y-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">PLATFORM</span>
                  <ul className="space-y-6">
                    {["Projeler", "Uzmanlar", "Firmalar", "İş İlanları"].map((item) => (
                      <li key={item}>
                        <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-lg font-bold uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-between group">
                          {item}
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
               </div>

               {/* Agency Links */}
               <div className="space-y-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">CORPORATE</span>
                  <ul className="space-y-6">
                    {["Hakkımızda", "Hizmetler", "İletişim", "Kariyer"].map((item) => (
                      <li key={item}>
                        <Link href="#" className="text-lg font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
               </div>

               {/* Legal Links */}
               <div className="space-y-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">LEGAL</span>
                  <ul className="space-y-6">
                    {["Gizlilik", "Koşullar", "Çerezler"].map((item) => (
                      <li key={item}>
                        <Link href="#" className="text-lg font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
               </div>

            </div>

            {/* Newsletter Subscription */}
            <div className="mt-20 p-10 bg-white/5 rounded-[3rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                     <span className="text-[8px] font-black uppercase tracking-[0.5em] text-blue-600 mb-2 block">NEWSLETTER</span>
                     <h4 className="text-2xl font-black italic uppercase tracking-tighter">Ağımıza Katılın</h4>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                     <Input 
                        placeholder="E-POSTA ADRESİNİZ" 
                        className="h-14 bg-black border-white/10 rounded-full px-8 text-[10px] font-black uppercase tracking-widest w-full md:w-64" 
                     />
                     <Button className="h-14 px-8 bg-white text-black hover:bg-blue-600 hover:text-white rounded-full font-black uppercase tracking-widest transition-all">
                        KATIL
                     </Button>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">BACK TO TOP</span>
              <div 
                 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                 className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all"
              >
                 <ArrowUpRight className="w-5 h-5 -rotate-45" />
              </div>
           </div>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              <span>DESIGNED IN ISTANBUL</span>
              <span>DEV_MP_V2.0</span>
           </div>
        </div>
      </div>
    </footer>
  );
}