'use client';

import { useState, useEffect, useCallback } from 'react';
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign,
  Building2,
  Users,
  Calendar,
  Briefcase,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle,
  Star,
  Eye,
  BookmarkPlus,
  X,
  ArrowUpRight,
  Filter,
  Zap,
  Globe,
  Layers,
  Loader2,
  Plus
} from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

// API Configuration
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  job_type: string;
  location: string;
  salary_min: string | number;
  salary_max: string | number;
  salary_currency: string;
  experience_level: string;
  category: string;
  status: string;
  featured: boolean;
  remote_allowed: boolean;
  created_at: string;
  expires_at: string;
  users: {
    first_name: string;
    last_name: string;
    company_name: string;
    profile_image_url: string | null;
  };
  _count: {
    job_applications: number;
  };
}

const jobTypes = ["Tam Zamanlı", "Yarı Zamanlı", "Sözleşmeli", "Freelance", "Staj"];
const experienceLevels = ["Entry Level (0-2)", "Mid Level (2-5)", "Senior (5-8)", "Expert (8+)"];
const locations = ["İstanbul", "Ankara", "İzmir", "Uzaktan", "Global"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery); // Backend needs to support search if not already
      if (selectedLocation !== 'All Locations') params.append('location', selectedLocation);
      if (selectedTypes.length > 0) params.append('job_type', selectedTypes[0]); // Simple filter for now

      const response = await fetch(`${API_URL}/api/jobs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedLocation, selectedTypes]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchJobs]);

  const toggleType = (type: string) => {
     setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const formatSalary = (min: string | number, max: string | number, currency: string = 'TRY') => {
    if (!min && !max) return 'Belirtilmemiş';
    return `${Number(min).toLocaleString()} - ${Number(max).toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays < 1) return 'Bugün';
      if (diffDays === 1) return 'Dün';
      if (diffDays < 7) return `${diffDays} gün önce`;
      return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 overflow-x-hidden selection:bg-blue-600 selection:text-white font-sans">
      
       {/* Background Grid */}
       <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" className="scale-150">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#0a0a0a] border-l border-black/10 dark:border-white/10 p-6 overflow-y-auto shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black uppercase tracking-widest">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                        <X className="h-6 w-6" />
                    </button>
                 </div>
                 {/* Mobile Filters */}
                 <div className="space-y-8">
                     <div>
                        <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-slate-500">Job Type</h3>
                        <div className="space-y-2">
                             {jobTypes.map(type => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                     <div className={`w-4 h-4 border border-black/20 dark:border-white/20 transition-colors flex items-center justify-center ${selectedTypes.includes(type) ? 'bg-blue-600 border-blue-600' : 'group-hover:border-blue-600'}`}>
                                          {selectedTypes.includes(type) && <CheckCircle className="w-3 h-3 text-white" />}
                                     </div>
                                     <span className="font-mono text-sm uppercase">{type}</span>
                                     <input type="checkbox" className="hidden" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                                </label>
                             ))}
                        </div>
                     </div>
                     <Button className="w-full rounded-none uppercase font-black tracking-widest" onClick={() => setShowMobileFilters(false)}>
                        Apply Filters
                     </Button>
                 </div>
            </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="relative z-10 pt-32 pb-16 px-6 container mx-auto border-b border-black/10 dark:border-white/10">
          <div className="flex flex-col gap-4 mb-12">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                        <Badge variant="outline" className="rounded-none border-blue-600 text-blue-600 uppercase font-bold tracking-widest px-3 py-1">
                            Beta v2.0
                        </Badge>
                        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                            Last Updated: {new Date().toLocaleDateString()}
                        </span>
                   </div>
                   <Link href="/is-ilanlari/yeni">
                       <Button className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-6 h-12 flex items-center gap-2">
                           <Plus className="w-5 h-5" /> Post A Job
                       </Button>
                   </Link>
               </div>
               <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
                   Career //<br/>Opportunities
               </h1>
          </div>

          {/* STATS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-black/10 dark:border-white/10 divide-x divide-black/10 dark:divide-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                {[
                    { label: "Open Positions", value: jobs.length }, // Not accurate total but works for now
                    { label: "Avg Salary", value: "₺22k" },
                    { label: "Remote Rate", value: "35%" },
                    { label: "New Today", value: "12" }
                ].map((stat, i) => (
                    <div key={i} className="p-4 md:p-6 text-center">
                        <span className="block text-2xl md:text-3xl font-black mb-1">{isLoading ? '-' : stat.value}</span>
                        <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-500">{stat.label}</span>
                    </div>
                ))}
          </div>

           {/* SEARCH BAR */}
            <div className="flex flex-col md:flex-row gap-0 mt-12 bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10">
                <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 px-6 py-4">
                     <Search className="w-5 h-5 text-slate-400 mr-4" />
                     <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH ROLE, KEYWORD OR STUDIO..." 
                        className="bg-transparent w-full font-bold uppercase placeholder:text-slate-300 focus:outline-none"
                    />
                </div>
                <div className="md:w-1/3 flex items-center px-6 py-4">
                     <MapPin className="w-5 h-5 text-slate-400 mr-4" />
                      <select 
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="bg-transparent w-full font-bold uppercase text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                      >
                          <option>All Locations</option>
                          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                </div>
                <Button className="h-full py-6 px-8 rounded-none bg-black hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-600 text-white dark:text-black hover:text-white dark:hover:text-white font-black uppercase tracking-widest md:w-auto w-full transition-colors">
                    Search
                </Button>
            </div>
      </div>

      <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
          
          {/* DESKTOP SIDEBAR FILTERS */}
          <div className="hidden lg:block w-72 shrink-0">
               <div className="sticky top-32 space-y-12">
                   
                   {/* Job Type Section */}
                   <div>
                       <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                           <Briefcase className="w-3 h-3" /> Job Type
                       </h3>
                       <div className="space-y-3">
                            {jobTypes.map(type => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity">
                                     <div className={`w-4 h-4 border border-black/20 dark:border-white/20 transition-colors flex items-center justify-center ${selectedTypes.includes(type) ? 'bg-blue-600 border-blue-600' : 'group-hover:border-black dark:group-hover:border-white'}`}>
                                          {selectedTypes.includes(type) && <CheckCircle className="w-3 h-3 text-white" />}
                                     </div>
                                     <span className="font-mono text-xs uppercase text-slate-600 dark:text-slate-400">{type}</span>
                                     <input type="checkbox" className="hidden" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                                </label>
                            ))}
                       </div>
                   </div>

                    {/* Experience Section */}
                   <div>
                       <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                           <Layers className="w-3 h-3" /> Experience
                       </h3>
                       <div className="space-y-3">
                            {experienceLevels.map(lvl => (
                                <label key={lvl} className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity">
                                     <div className="w-4 h-4 border border-black/20 dark:border-white/20 transition-colors group-hover:border-black dark:group-hover:border-white" />
                                     <span className="font-mono text-xs uppercase text-slate-600 dark:text-slate-400">{lvl}</span>
                                </label>
                            ))}
                       </div>
                   </div>
                   
                   <Button onClick={() => { setSearchQuery(''); setSelectedLocation('All Locations'); setSelectedTypes([]); }} variant="outline" className="w-full rounded-none border-black/10 dark:border-white/10 uppercase font-bold tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                        Reset Filters
                   </Button>
               </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
               
               {/* Controls */}
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10 dark:border-white/10">
                    <span className="font-mono text-xs uppercase text-slate-500">
                        {isLoading ? 'Loading...' : `Showing ${jobs.length} Positions`}
                    </span>
                    <div className="flex items-center gap-4">
                         <Button 
                            variant="ghost" 
                            className="lg:hidden uppercase font-bold text-xs tracking-wider"
                            onClick={() => setShowMobileFilters(true)}
                         >
                            <Filter className="w-4 h-4 mr-2" /> Filters
                         </Button>
                         <div className="hidden md:flex items-center gap-2">
                             <span className="font-mono text-xs uppercase text-slate-500 mr-2">Sort By:</span>
                             <select className="bg-transparent font-bold uppercase text-xs focus:outline-none cursor-pointer">
                                 <option>Newest First</option>
                                 <option>Salary High-Low</option>
                                 <option>Most Viewed</option>
                             </select>
                         </div>
                    </div>
               </div>

               {/* Job List */}
               <div className="space-y-6">
                   {isLoading ? (
                       <div className="flex justify-center py-20">
                           <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                       </div>
                   ) : jobs.length === 0 ? (
                       <div className="text-center py-20 border border-dashed border-black/10 dark:border-white/10">
                           <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                           <h3 className="text-xl font-bold uppercase mb-2">No Openings Found</h3>
                           <p className="text-slate-500">Try adjusting your search criteria.</p>
                       </div>
                   ) : (
                       jobs.map(job => (
                           <div key={job.id} className="group relative bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 hover:border-blue-600 dark:hover:border-blue-600 transition-colors duration-300">
                                 
                                 <div className="flex flex-col md:flex-row">
                                      
                                      {/* Left: Main Info */}
                                      <div className="p-6 md:p-8 flex-1">
                                           
                                           <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 rounded-none border border-black/10 dark:border-white/10">
                                                        <AvatarImage src={job.users.profile_image_url || undefined} />
                                                        <AvatarFallback className="rounded-none bg-black text-white dark:bg-white dark:text-black font-bold">
                                                            {job.users.company_name ? job.users.company_name.charAt(0) : 'C'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="text-xl md:text-2xl font-black uppercase italic leading-none group-hover:text-blue-600 transition-colors">
                                                            {job.title}
                                                        </h3>
                                                        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                                                            {job.users.company_name || 'Anonymous Company'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Badges */}
                                                <div className="flex flex-col items-end gap-2">
                                                    {job.featured && (
                                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-none text-[8px] font-black uppercase tracking-widest px-2 py-1">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                           </div>

                                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pt-6 border-t border-black/5 dark:border-white/5">
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest text-slate-400 mb-1">Location</span>
                                                    <span className="font-mono text-xs font-bold uppercase flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-blue-600" /> {job.location || 'Remote'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest text-slate-400 mb-1">Schedule</span>
                                                    <span className="font-mono text-xs font-bold uppercase">
                                                        {job.job_type}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest text-slate-400 mb-1">Salary</span>
                                                    <span className="font-mono text-xs font-bold uppercase text-green-600">
                                                        {formatSalary(job.salary_min, job.salary_max)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] uppercase tracking-widest text-slate-400 mb-1">Posted</span>
                                                    <span className="font-mono text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                                         <Clock className="w-3 h-3" /> {formatDate(job.created_at)}
                                                    </span>
                                                </div>
                                           </div>

                                           <p className="font-serif text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                                               {job.description}
                                           </p>

                                           {/* Categories/Tags could go here */}

                                      </div>

                                      {/* Right: Actions (Desktop) */}
                                       <div className="w-full md:w-auto md:border-l border-t md:border-t-0 border-black/10 dark:border-white/10 flex md:flex-col">
                                           <Link href={`/is-ilanlari/${job.id}`} className="flex-1 md:flex-none h-14 md:h-1/2 md:border-b border-r md:border-r-0 border-black/10 dark:border-white/10">
                                               <Button className="w-full h-full rounded-none bg-black hover:bg-blue-600 text-white dark:bg-white dark:text-black dark:hover:bg-blue-600 dark:hover:text-white uppercase font-black tracking-widest text-xs transition-colors">
                                                    Apply Now
                                               </Button>
                                           </Link>
                                           <Link href={`/is-ilanlari/${job.id}`} className="flex-1 md:flex-none h-14 md:h-1/2">
                                               <Button variant="ghost" className="w-full h-full rounded-none hover:bg-slate-100 dark:hover:bg-white/10 uppercase font-bold tracking-widest text-xs">
                                                    View Details
                                               </Button>
                                           </Link>
                                       </div>
                                 </div>
                           </div>
                       ))
                   )}
               </div>
               
               {/* Pagination (Visual only for now) */}
               <div className="mt-16 flex justify-center">
                   <Button variant="outline" disabled className="h-14 px-8 rounded-none border-black/10 dark:border-white/10 uppercase font-black tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors opacity-50">
                        Load More Opportunities
                   </Button>
               </div>

          </div>
      </div>

    </div>
  );
}