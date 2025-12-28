"use client";

import { motion } from "framer-motion";

export function Manifesto() {
  return (
    <section className="py-32 bg-white dark:bg-[#050505] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "circOut" }}
          >
            <h2 className="text-[6vw] lg:text-[5vw] font-black italic tracking-tighter uppercase leading-[0.8] mb-12">
              Architecture represents <br />
              <span className="text-blue-600">humanity’s attempt</span> <br />
              to outlive itself.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end">
              <p className="text-xl md:text-2xl font-bold text-slate-400 leading-tight border-l-4 border-blue-600 pl-8 uppercase">
                Mimariproje, sadece bir platform değil; mekanın, ışığın ve malzemenin dijital tezahürüdür. <br />
                <span className="text-slate-900 dark:text-white mt-4 block italic">Tasarım, hayatta kalmanın en sofistike formudur.</span>
              </p>
              
              <div className="space-y-4">
                <div className="h-[2px] w-full bg-slate-100 dark:bg-white/5" />
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                  <span>FOUNDATION</span>
                  <span>EST. 2025</span>
                  <span>MP-CORE-001</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
