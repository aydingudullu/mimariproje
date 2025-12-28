import { HeroAvantGarde } from "@/components/home/hero-avant-garde";
import { Manifesto } from "@/components/home/manifesto";
import { FeaturesShowcase } from "@/components/home/features-showcase";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#050505]">
      <HeroAvantGarde />
      <Manifesto />
      <FeaturesShowcase />
      
      {/* Dynamic CTA Footer Section */}
      <section className="py-40 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-[15vw] font-black italic uppercase leading-[0.7] tracking-tighter mb-20 opacity-20 select-none">ARCHITECTURE</h2>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-5xl md:text-7xl font-black italic uppercase mb-12">Yarını Bugünden <br/>İnşa Edin.</h3>
            <div className="flex flex-col md:flex-row justify-center gap-6">
               <button className="h-20 px-16 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-blue-600 hover:text-white transition-all">PROFESYONEL OLARAK KATIL</button>
               <button className="h-20 px-16 border-2 border-white/20 hover:border-white font-black uppercase tracking-widest rounded-full transition-all">PROJE YÜKLE</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}