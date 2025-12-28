'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Building2,
  CheckCircle,
  MessageCircle,
  Globe,
  Phone,
  Mail,
  Calendar,
  Users,
  Briefcase,
  Award,
  Loader2,
  ArrowLeft,
  Share2,
  Heart,
  ExternalLink,
  Clock,
  Trophy,
  Shield,
  Sparkles,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Company {
  id: number;
  company_name: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  avatar_url: string | null;
  specializations: string[];
  experience_years: number | null;
  is_verified: boolean;
  subscription_type: string | null;
  phone: string | null;
  email: string;
  created_at: string;
  projectCount: number;
  rating: number;
  reviewCount: number;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  price?: number;
  images?: string[];
  image_url?: string; // Fallback
}

// Fix: Remove trailing /api if present to avoid double /api in fetch calls
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

const coverImages = [
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600',
];

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const companyId = params.id as string;

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        // Ensure accurate API path
        const response = await fetch(`${API_URL}/api/companies/${companyId}`);
        
        if (!response.ok) {
          throw new Error('Firma bulunamadı');
        }
        
        const data = await response.json();
        setCompany(data.company);
        
        const projectsResponse = await fetch(`${API_URL}/api/projects?user_id=${companyId}&limit=6`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          // Normalize project images
          const normalizedProjects = (projectsData.projects || []).map((p: any) => ({
             ...p,
             image_url: p.images?.[0] || p.image_url
          }));
          setProjects(normalizedProjects);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/giris?redirect=/firma/${companyId}`);
      return;
    }

    if (!company) return;

    setIsStartingChat(true);
    try {
      const token = localStorage.getItem('mimariproje_access_token');
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: company.id,
          message: `Merhaba, ${company.company_name} hakkında bilgi almak istiyorum.`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Konuşma başlatılamadı');
      }

      const data = await response.json();
      router.push(`/mesajlar?id=${data.conversation.id}`);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsStartingChat(false);
    }
  };

  const getCoverImage = (id: number) => coverImages[id % coverImages.length];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
         <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">LOADING STUDIO PROFILE...</p>
         </div>
      </div>
    );
  }

  if (error || !company) {
    return (
       <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-white/10 p-10 bg-white/5 backdrop-blur-md">
          <Building2 className="h-12 w-12 text-red-500 mb-6" />
          <h1 className="text-3xl font-black italic uppercase mb-4">PROFILE NOT FOUND</h1>
          <p className="text-slate-400 mb-8 font-mono text-sm">{error || "This studio profile is currently unavailable."}</p>
          <Button asChild className="w-full bg-white text-black hover:bg-blue-600 hover:text-white rounded-none uppercase font-black tracking-widest">
            <Link href="/firmalar">Return to Index</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" className="scale-150">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* -- HERO SECTION -- */}
      <div className="relative min-h-[60vh] flex flex-col justify-end pb-12 px-6 border-b border-black/5 dark:border-white/5 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
            <Image 
              src={getCoverImage(company.id)} 
              alt="Cover" 
              fill 
              className="object-cover opacity-30 dark:opacity-20 grayscale contrast-125 scale-105"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/90 dark:to-transparent" />
        </div>

        <div className="container mx-auto relative z-10 pt-32">
             <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-4">
                     {company.is_verified && (
                        <Badge className="bg-blue-600 text-white rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-none flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" /> Verified Studio
                        </Badge>
                     )}
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        EST. {new Date(company.created_at).getFullYear()}
                     </span>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-8">
                     {/* Avatar */}
                    <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-black dark:border-white bg-black dark:bg-white overflow-hidden shrink-0">
                         <Avatar className="w-full h-full rounded-none">
                            <AvatarImage src={company.avatar_url || ''} className="object-cover" />
                            <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-black text-6xl rounded-none">
                                {company.company_name.charAt(0)}
                            </AvatarFallback>
                         </Avatar>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-black dark:text-white mb-4">
                           {company.company_name}
                        </h1>
                        <div className="flex items-center gap-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                             <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="uppercase">{company.location || "Global"}</span>
                             </div>
                             <div className="h-4 w-[1px] bg-current opacity-20" />
                             <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                                <span className="font-bold">{company.rating.toFixed(1)}</span>
                                <span className="opacity-50">/ 5.0</span>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
         </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* -- LEFT COLUMN (Main Content) -- */}
            <div className="lg:col-span-8 space-y-24">
                
                {/* 1. STUDIO MANIFESTO */}
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-6xl font-black text-black/5 dark:text-white/5">01</span>
                       <h2 className="text-2xl font-black uppercase tracking-widest">Studio Manifesto</h2>
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-p:font-serif prose-p:text-xl prose-p:leading-relaxed text-slate-700 dark:text-slate-300">
                       <p>{company.bio || "This studio prefers to let their architecture speak for itself. No manifesto provided."}</p>
                    </div>

                    {company.specializations.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                            {company.specializations.map(spec => (
                                <Badge key={spec} variant="outline" className="border-black/20 dark:border-white/20 rounded-none px-4 py-2 uppercase text-[10px] font-bold tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                    {spec}
                                </Badge>
                            ))}
                        </div>
                    )}
                </section>

                {/* 2. ARCHITECTURAL PORTFOLIO */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <span className="text-6xl font-black text-black/5 dark:text-white/5">02</span>
                            <h2 className="text-2xl font-black uppercase tracking-widest">Architectural Portfolio</h2>
                        </div>
                        <span className="font-mono text-xs text-slate-500">
                           {company.projectCount} PROJECTS
                        </span>
                    </div>

                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {projects.map((project, idx) => (
                                <Link href={`/proje/${project.id}`} key={project.id} className="group block">
                                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-white/5 mb-4 border border-black/5 dark:border-white/5">
                                        <Image 
                                            src={project.image_url || getCoverImage(project.id)} 
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 text-black dark:bg-black/90 dark:text-white border-none rounded-none text-[10px] font-bold uppercase tracking-widest">
                                                {project.category}
                                            </Badge>
                                        </div>
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-blue-600/90 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <ArrowUpRight className="text-white w-12 h-12 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase leading-none mb-2 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                                    <p className="text-xs font-mono text-slate-500 uppercase tracking-wide line-clamp-2">{project.description}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-dashed border-black/20 dark:border-white/20 p-12 text-center">
                            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-mono text-sm uppercase">Empty Archive</p>
                        </div>
                    )}
                </section>

            </div>

             {/* -- RIGHT COLUMN (Sticky Sidebar) -- */}
             <div className="lg:col-span-4 relative">
                <div className="sticky top-24 space-y-8">
                    
                    {/* STATS STRIP */}
                    <div className="grid grid-cols-3 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
                        <div className="bg-white dark:bg-[#0a0a0a] p-4 text-center">
                            <span className="block text-2xl font-black">{company.projectCount}</span>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500">Projects</span>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] p-4 text-center">
                            <span className="block text-2xl font-black">{company.experience_years || 1}</span>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500">Years Exp</span>
                        </div>
                        <div className="bg-white dark:bg-[#0a0a0a] p-4 text-center">
                            <span className="block text-2xl font-black">{company.reviewCount}</span>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500">Reviews</span>
                        </div>
                    </div>

                    {/* CONTACT CARD */}
                    <div className="bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Studio Contact
                        </h3>

                        <div className="space-y-4 font-mono text-xs">
                             {company.phone && (
                                <a href={`tel:${company.phone}`} className="flex items-center justify-between group hover:text-blue-600 transition-colors">
                                    <span className="text-slate-500 uppercase">Phone</span>
                                    <span className="font-bold">{company.phone}</span>
                                </a>
                             )}
                             <a href={`mailto:${company.email}`} className="flex items-center justify-between group hover:text-blue-600 transition-colors">
                                <span className="text-slate-500 uppercase">Email</span>
                                <span className="font-bold truncate max-w-[180px]">{company.email}</span>
                             </a>
                             {company.website && (
                                <a href={`https://${company.website}`} target="_blank" className="flex items-center justify-between group hover:text-blue-600 transition-colors">
                                    <span className="text-slate-500 uppercase">Web</span>
                                    <span className="font-bold flex items-center gap-1">
                                        {company.website} <ExternalLink className="w-3 h-3" />
                                    </span>
                                </a>
                             )}
                        </div>

                        <Button 
                            className="w-full h-14 bg-blue-600 hover:bg-black dark:hover:bg-white text-white dark:hover:text-black rounded-none font-black uppercase tracking-widest text-xs transition-all"
                            onClick={handleStartChat}
                            disabled={isStartingChat || (user?.id === company.id)}
                        >
                            {isStartingChat ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <MessageCircle className="h-4 w-4 mr-2" />
                            )}
                            Init Protocol
                        </Button>
                    </div>

                    {/* ACTIONS */}
                     <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setIsFavorite(!isFavorite)} className={`h-12 rounded-none border-black/10 dark:border-white/10 uppercase text-[10px] font-bold tracking-wider hover:bg-red-50 dark:hover:bg-red-900/20 ${isFavorite ? "border-red-500 text-red-500" : ""}`}>
                            <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                            Follow
                        </Button>
                        <Button variant="outline" className="h-12 rounded-none border-black/10 dark:border-white/10 uppercase text-[10px] font-bold tracking-wider">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>

                </div>
             </div>

         </div>
      </div>

    </div>
  );
}
