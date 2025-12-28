"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/api";

interface ProjectCardAvantGardeProps {
  project: Project;
  index: number;
}

export function ProjectCardAvantGarde({ project, index }: ProjectCardAvantGardeProps) {
  // Safe project user handling
  const userName = project.user?.full_name || 
                   project.user?.company_name || 
                   (project.user?.first_name ? `${project.user.first_name} ${project.user.last_name || ''}` : null) ||
                   "Mimariproje Üyesi";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative block w-full aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-neutral-900 shadow-2xl"
    >
        <Link href={`/proje/${project.id}`} className="block w-full h-full">
            {/* Image Background */}
            <div className="absolute inset-0 z-0">
                {project.images && project.images.length > 0 ? (
                <Image
                    src={project.images[0]}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 dark:opacity-70 group-hover:opacity-100 dark:group-hover:opacity-50 grayscale hover:grayscale-0"
                />
                ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-black dark:via-black/60 dark:to-transparent opacity-90 dark:opacity-100" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                
                {/* Top Section */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        {project.is_featured && (
                             <Badge className="bg-blue-600 text-white border-none rounded-none text-[8px] font-black uppercase tracking-widest self-start px-2">
                                FEATURED
                             </Badge>
                        )}
                        <Badge variant="outline" className="bg-white/40 dark:bg-white/5 border-black/10 dark:border-white/20 text-black dark:text-white/80 backdrop-blur-md rounded-none uppercase tracking-widest text-[8px] font-bold px-2 py-1 self-start">
                            {project.category}
                        </Badge>
                    </div>
                    
                    <div className="w-10 h-10 border border-black/10 dark:border-white/20 rounded-full flex items-center justify-center text-black dark:text-white opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="flex items-center gap-2 mb-4 text-black/50 dark:text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-500" />
                        <span>{project.location || "KONUM YOK"}</span>
                    </div>
                    
                    <h3 className="text-3xl font-black italic text-black dark:text-white uppercase leading-[0.9] mb-4 break-words group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">
                        {project.title}
                    </h3>

                    <div className="h-[1px] w-12 bg-black/20 dark:bg-white/20 mb-4 group-hover:w-full transition-all duration-500 ease-in-out" />

                    {/* Architect Info & Price - Revealed on Hover */}
                    <div className="flex justify-between items-end opacity-80 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-black/60 dark:text-white/60" />
                            <span className="text-[10px] font-bold text-black/80 dark:text-white/80 uppercase tracking-wider">
                                {userName}
                            </span>
                        </div>
                        {project.price > 0 && (
                            <span className="text-lg font-black text-black dark:text-white italic tracking-tighter">
                                ₺{project.price.toLocaleString('tr-TR')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Border Effect */}
            <div className="absolute inset-0 border border-black/5 dark:border-white/5 group-hover:border-blue-600/50 transition-colors duration-500 pointer-events-none" />
        </Link>
    </motion.div>
  );
}
