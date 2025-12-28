"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Eye,
  Heart,
  Share2,
  Download,
  ShoppingCart,
  MessageCircle,
  Calendar,
  Ruler,
  Home,
  CheckCircle,
  ArrowLeft,
  Maximize,
  Shield,
  Award,
  Clock,
  Loader2,
  AlertCircle,
  Box,
  Layers,
  Layout,
  User,
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { projectsApi, messagesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Project } from "@/lib/api";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const containerRef = useRef(null);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await projectsApi.getProject(Number(params.id));

        if (response.success && response.data) {
          const backendBody = response.data as any;
          const rawProject = backendBody.data?.project || backendBody.project;

          if (!rawProject) {
             setError("Proje verisi okunamadı");
             return;
          }
          
          setProject({
            ...rawProject,
            price: Number(rawProject.price),
            images: rawProject.images || (rawProject.project_images ? rawProject.project_images.map((img: any) => img.image_url) : []),
            specifications: rawProject.specifications || {
                totalArea: rawProject.area || "-",
                buildingArea: "-",
                gardenArea: "-",
                floors: "-",
                rooms: "-",
                bathrooms: "-",
                garage: "-",
                features: []
            },
            deliverables: rawProject.deliverables || ["Mimari Proje (DWG)", "3D Görseller (JPG)", "Raporlama (PDF)"],
            tags: rawProject.tags || [],
            reviews: rawProject.reviews || [],
            license: rawProject.license || {
                 type: "Standart",
                 description: "Bu proje sadece kişisel kullanım içindir.",
                 modifications: "İzin verilmez",
                 resale: "Yasaktır"
            }
          });
        } else {
          setError(response.error || "Proje bulunamadı");
        }
      } catch (error: any) {
        setError(`Sistem Hatası: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const handleLike = async () => {
    if (!isAuthenticated || !project) {
      router.push("/auth/giris");
      return;
    }
    try {
      await projectsApi.likeProject(project.id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated || !project) {
      router.push("/auth/giris");
      return;
    }
    setIsSending(true);
    try {
      const response = await messagesApi.createConversation({
        other_user_id: project.user_id,
        initial_message: `Merhaba, "${project.title}" projeniz hakkında bilgi almak istiyorum.`,
      });
      if (response.success) {
        router.push("/mesajlar");
      }
    } catch (error) {
      console.error("Message send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Safe user display
  const getUserName = () => {
      if (!project?.user) return "Mimariproje Üyesi";
      return project.user.full_name || project.user.company_name || `${project.user.first_name || ''} ${project.user.last_name || ''}`.trim() || "Gizli Üye";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
         <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">LOADING ARCHIVE...</p>
         </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-white/10 p-10 bg-white/5 backdrop-blur-md">
          <AlertCircle className="h-12 w-12 text-red-500 mb-6" />
          <h1 className="text-3xl font-black italic uppercase mb-4">Erİşİm Hatası</h1>
          <p className="text-slate-400 mb-8 font-mono text-sm">{error}</p>
          <Button asChild className="w-full bg-white text-black hover:bg-blue-600 hover:text-white rounded-none uppercase font-black tracking-widest">
            <Link href="/projeler">Back to Archive</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Scroll Progress - Optional Fancy Touch */}
      
      {/* Background Grid - Homepage Style */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" className="scale-150">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* -- HERO SECTION -- */}
      <div className="relative min-h-[90vh] flex flex-col justify-end pb-20 pt-40 px-6 border-b border-black/5 dark:border-white/5">
         <div className="absolute inset-0 z-0">
             {project.images && project.images.length > 0 ? (
                 <>
                   <Image 
                      src={project.images[0]} 
                      alt={project.title} 
                      fill 
                      className="object-cover opacity-20 dark:opacity-30 grayscale contrast-125"
                      priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/90 dark:to-transparent" />
                 </>
             ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-[#0f0f0f]" />
             )}
         </div>

         <div className="container mx-auto relative z-10">
             <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="bg-black/5 dark:bg-white/10 backdrop-blur-sm border-black/10 dark:border-white/20 text-black dark:text-white rounded-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        {project.category}
                    </Badge>
                     {project.is_featured && (
                        <Badge className="bg-blue-600 text-white rounded-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-none">
                            Featured
                        </Badge>
                     )}
                     <div className="h-[1px] w-20 bg-black/20 dark:bg-white/20 hidden sm:block" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {project.location || "Unknown Location"}
                     </span>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black italic uppercase tracking-tighter leading-[0.8] text-black dark:text-white max-w-5xl">
                   {project.title}
                </h1>
                
                <div className="flex items-center gap-2 mt-4 text-sm font-mono text-slate-500">
                    <span className="text-blue-600">ID:</span> 
                    <span>{project.id.toString().padStart(4, '0')}</span>
                    <span className="mx-2">//</span>
                    <span>PUBLISHED: {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
             </div>
         </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* -- LEFT COLUMN (Main Content) -- */}
            <div className="lg:col-span-8 space-y-24">
                
                {/* 1. THE STORY */}
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-6xl font-black text-black/5 dark:text-white/5">01</span>
                       <h2 className="text-2xl font-black uppercase tracking-widest">The Story</h2>
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-p:font-serif prose-p:text-xl prose-p:leading-relaxed text-slate-700 dark:text-slate-300">
                       <p>{project.description}</p>
                    </div>
                </section>

                {/* 2. VISUALS (Horizontal Gallery) */}
                <section className="overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-6xl font-black text-black/5 dark:text-white/5">02</span>
                       <h2 className="text-2xl font-black uppercase tracking-widest">Visuals</h2>
                    </div>
                    <div className="-mx-4 sm:-mx-0 overflow-x-auto pb-8 scrollbar-hide flex gap-4 snap-x">
                        {project.images && project.images.map((img, i) => (
                           <div key={i} className="snap-center shrink-0 w-[85vw] sm:w-[600px] h-[400px] sm:h-[500px] relative bg-slate-100 dark:bg-white/5 overflow-hidden group">
                                <Image src={img} alt={`View ${i}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute bottom-4 left-4 bg-black/50 text-white text-[10px] font-bold px-2 py-1 backdrop-blur-md uppercase tracking-wider">
                                   View {String(i + 1).padStart(2, '0')}
                                </div>
                           </div>
                        ))}
                    </div>
                </section>

                {/* 3. BLUEPRINT / SPECS */}
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-6xl font-black text-black/5 dark:text-white/5">03</span>
                       <h2 className="text-2xl font-black uppercase tracking-widest">Blueprint // Specs</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
                        {/* Spec Items */}
                        <div className="bg-white dark:bg-[#0a0a0a] p-8 flex flex-col gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Area</span>
                             <span className="text-3xl font-black italic">{project.specifications.totalArea} <span className="text-sm font-normal not-italic text-slate-500">m²</span></span>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] p-8 flex flex-col gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Architecture Style</span>
                             <span className="text-3xl font-black italic">{project.style || "Modern"}</span>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] p-8 flex flex-col gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Floors</span>
                             <span className="text-3xl font-black italic">{project.specifications.floors}</span>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] p-8 flex flex-col gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rooms</span>
                             <span className="text-3xl font-black italic">{project.specifications.rooms}</span>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {project.specifications.features.map((feat: string) => (
                           <div key={feat} className="flex items-center gap-3 py-3 border-b border-black/5 dark:border-white/5">
                               <div className="w-1 h-1 bg-blue-600 rounded-full" />
                               <span className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">{feat}</span>
                           </div>
                        ))}
                    </div>
                </section>

                 {/* 4. DELIVERABLES */}
                 <section>
                   <div className="bg-blue-600 text-white p-10 relative overflow-hidden">
                       <div className="relative z-10">
                           <h3 className="text-xl font-black uppercase tracking-widest mb-8">What's Included?</h3>
                           <ul className="space-y-4">
                               {project.deliverables.map((item: string) => (
                                   <li key={item} className="flex items-center gap-4">
                                       <Box className="w-5 h-5 text-blue-200" />
                                       <span className="font-bold uppercase tracking-wide text-sm">{item}</span>
                                   </li>
                               ))}
                           </ul>
                       </div>
                       {/* Abstract BG */}
                       <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                           <Layers className="w-64 h-64" />
                       </div>
                   </div>
                 </section>

                {/* 5. REVIEWS */}
                <section>
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-6 mb-8">
                       <h2 className="text-xl font-black uppercase tracking-widest">Public Review</h2>
                       <div className="flex items-center gap-2">
                           <Star className="w-5 h-5 fill-black dark:fill-white" />
                           <span className="font-black text-xl">{project.rating}</span>
                           <span className="text-sm text-slate-500 font-mono">({project.reviews?.length || 0})</span>
                       </div>
                    </div>

                    <div className="space-y-8">
                        {project.reviews && project.reviews.length > 0 ? project.reviews.map((review: any) => (
                           <div key={review.id} className="flex gap-4">
                               <Avatar>
                                   <AvatarImage src={review.user.avatar} />
                                   <AvatarFallback className="bg-black text-white font-bold">{review.user.name[0]}</AvatarFallback>
                               </Avatar>
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <h4 className="font-bold uppercase text-sm">{review.user.name}</h4>
                                       <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-blue-600 text-blue-600" : "text-slate-300"}`} />
                                          ))}
                                       </div>
                                   </div>
                                   <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                               </div>
                           </div>
                        )) : (
                            <p className="text-slate-500 italic">No reviews yet for this masterpiece.</p>
                        )}
                    </div>
                </section>

            </div>

            {/* -- RIGHT COLUMN (Sticky Sidebar) -- */}
            <div className="lg:col-span-4 relative">
               <div className="sticky top-24 space-y-8">
                   
                   {/* ACTION CARD */}
                   <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-600/20" />
                       
                       <div className="relative z-10">
                            <div className="flex flex-col gap-1 mb-8">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">License Acquisition</span>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-4xl font-black italic">{project.price.toLocaleString()}</span>
                                   <span className="text-xl font-bold text-slate-400">{project.currency || "₺"}</span>
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-blue-600 hover:bg-black dark:hover:bg-white text-white dark:hover:text-black rounded-none font-black uppercase tracking-widest text-xs transition-all mb-4">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Purchase License
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={handleLike} className={`h-12 rounded-none border-black/10 dark:border-white/10 uppercase text-[10px] font-bold tracking-wider hover:bg-red-50 dark:hover:bg-red-900/20 ${isLiked ? "border-red-500 text-red-500" : ""}`}>
                                    <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                                    {project.saves} Likes
                                </Button>
                                <Button variant="outline" className="h-12 rounded-none border-black/10 dark:border-white/10 uppercase text-[10px] font-bold tracking-wider">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 space-y-3">
                                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                     <Shield className="w-4 h-4 text-green-500" />
                                     <span>Verified Architecture</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                     <Download className="w-4 h-4 text-blue-500" />
                                     <span>Instant Digital Delivery</span>
                                </div>
                            </div>
                       </div>
                   </div>

                   {/* ARCHITECT PROFILE */}
                   <div className="border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-[#0a0a0a]">
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-14 w-14 border-2 border-black dark:border-white">
                                <AvatarImage src={project.user?.profile_image_url || project.user?.avatar_url} />
                                <AvatarFallback className="bg-black text-white font-bold">{getUserName().charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-bold uppercase text-sm leading-tight">{getUserName()}</h4>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-1">
                                    {project.user?.user_type === "individual" ? "Architect" : "Studio"}
                                </span>
                            </div>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            className="w-full text-xs font-black uppercase tracking-widest h-12 rounded-none border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            onClick={handleSendMessage}
                            disabled={isSending}
                        >
                            {isSending ? "Initiating..." : "Contact Architect"}
                        </Button>
                   </div>

                   {/* TAGS */}
                   <div className="flex flex-wrap gap-2">
                       {project.tags?.map(tag => (
                           <span key={tag} className="text-[10px] font-mono text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">#{tag}</span>
                       ))}
                   </div>

               </div>
            </div>

         </div>
      </div>
      
    </div>
  );
}
