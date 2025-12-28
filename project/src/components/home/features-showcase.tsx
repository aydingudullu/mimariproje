"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Users, Building2, Briefcase, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    title: "Seçkin Uzmanlar",
    description: "Türkiye'nin en yetenekli mimarları ve tasarım ofisleri burada.",
    icon: Users,
    href: "/uzmanlar",
    color: "bg-blue-600",
    size: "lg:col-span-7"
  },
  {
    title: "Premium Projeler",
    description: "İlham veren, ödüllü ve vizyoner projeleri keşfedin.",
    icon: Sparkles,
    href: "/projeler",
    color: "bg-slate-900 dark:bg-white",
    size: "lg:col-span-5"
  },
  {
    title: "İş İlanları",
    description: "Kariyerinizde bir sonraki büyük adımı atın.",
    icon: Briefcase,
    href: "/is-ilanlari",
    color: "bg-slate-100 dark:bg-white/5",
    size: "lg:col-span-5"
  },
  {
    title: "Kurumsal Çözümler",
    description: "Firmanızın görünürlüğünü artırın ve ağınızı genişletin.",
    icon: Building2,
    href: "/firmalar",
    color: "bg-blue-100 dark:bg-blue-900/20",
    size: "lg:col-span-7"
  }
];

export function FeaturesShowcase() {
  return (
    <section className="py-20 bg-white dark:bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block">ECOSYSTEM</span>
             <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
               Core<br/>Modules.
             </h2>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs max-w-sm text-right leading-relaxed">
            Mimariproje ekosistemi, tasarım sürecinin her aşamasını dijital bir akışla birleştirir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`${feature.size} group relative h-[400px] rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5`}
            >
              <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0`} />
              
              <div className="relative z-10 h-full p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="w-16 h-16 bg-white dark:bg-[#0c0c0c] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                   </div>
                   <Link href={feature.href}>
                      <div className="w-12 h-12 border-2 border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowUpRight className="w-6 h-6" />
                      </div>
                   </Link>
                </div>
                
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-white dark:group-hover:text-black transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] group-hover:text-white/80 dark:group-hover:text-black/60 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Bauhaus Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-black/20 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
