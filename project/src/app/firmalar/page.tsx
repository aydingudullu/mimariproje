'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Star, 
  Building2,
  CheckCircle,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  MessageCircle,
  Globe,
  Phone,
  Mail,
  X,
  ChevronDown,
  Users,
  Briefcase,
  Award,
  Loader2,
  Grid,
  List,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Types - matching backend API response
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

// Fix: Remove trailing /api if present
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

const defaultCoverImages = [
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const specialtiesOptions = ["Konut", "Ticari", "İç Mimari", "Villa", "Restorasyon", "Peyzaj", "Ofis", "Otel"];
const sortOptions = [
  { value: "rating", label: "HIGHEST RATED" },
  { value: "projects", label: "MOST PROJECTS" },
  { value: "newest", label: "NEWEST" },
  { value: "name", label: "ALPHABETICAL" },
];

export default function CompaniesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<string[]>(['All Locations']);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCount, setTotalCount] = useState(0);
  const [contactingId, setContactingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch companies from API
  const fetchCompanies = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedLocation !== 'All Locations') params.append('location', selectedLocation);
      if (selectedSpecialties.length > 0) params.append('specialization', selectedSpecialties[0]);
      params.append('sortBy', sortBy);
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`${API_URL}/api/companies?${params.toString()}`);
      
      if (!response.ok) throw new Error('Firmalar yüklenemedi');
      
      const data = await response.json();
      const newCompanies = data.companies || [];
      
      if (append) {
        setCompanies(prev => [...prev, ...newCompanies]);
      } else {
        setCompanies(newCompanies);
      }
      
      setTotalCount(data.pagination?.total || 0);
      setHasMore(newCompanies.length === 12 && companies.length + newCompanies.length < (data.pagination?.total || 0));
    } catch (error) {
      console.error('Fetch companies error:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, selectedLocation, selectedSpecialties, sortBy]);

  // Fetch locations for filter
  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/companies/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(['All Locations', ...(data.locations || [])]);
      }
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Fetch companies when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchCompanies(1, false);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchCompanies]);

  // Load more companies
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCompanies(nextPage, true);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All Locations');
    setSelectedSpecialties([]);
  };

  const hasActiveFilters = searchQuery || selectedLocation !== 'All Locations' || selectedSpecialties.length > 0;
  const getCoverImage = (id: number) => defaultCoverImages[id % defaultCoverImages.length];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 selection:bg-blue-600 selection:text-white">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" className="scale-150">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

     {/* Filter Sidebar (Mobile) */}
     {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#0a0a0a] shadow-2xl border-l border-black/10 dark:border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-widest">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
             {/* Mobile Filter Content - Simplified copy of desktop */}
             <div className="space-y-8">
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-slate-500">Location</h3>
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent border-b border-black/20 dark:border-white/20 py-2 rounded-none font-mono text-sm focus:outline-none focus:border-blue-600"
                  >
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                   <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-slate-500">Specialty</h3>
                   <div className="flex flex-wrap gap-2">
                      {specialtiesOptions.map(spec => (
                        <button 
                          key={spec}
                          onClick={() => toggleSpecialty(spec)}
                          className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider border transition-all ${
                            selectedSpecialties.includes(spec) 
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' 
                            : 'border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                   </div>
                </div>
                <Button className="w-full rounded-none uppercase font-black tracking-widest" onClick={() => setShowMobileFilters(false)}>
                  Apply Strategy
                </Button>
             </div>
          </div>
        </div>
      )}

      <div className="relative z-10 pt-32 pb-20 px-6 container mx-auto">
        
        {/* HERO HEADER */}
        <div className="mb-20">
             <div className="flex flex-col gap-2 mb-8">
                <span className="font-mono text-xs text-blue-600 uppercase tracking-widest mb-2 block">
                    Directory // {totalCount} Entities
                </span>
                <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
                    Architectural<br/>Directory
                </h1>
                <p className="max-w-xl text-lg font-serif text-slate-600 dark:text-slate-400 leading-relaxed">
                   A curated index of Turkey's premier architectural studios. Filter by specialization, location, or rating.
                </p>
             </div>

             {/* Search & Toolbar */}
             <div className="flex flex-col md:flex-row gap-6 items-end border-b border-black/10 dark:border-white/10 pb-8">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SEARCH STUDIO OR SPECIALTY..."
                      className="w-full pl-8 border-0 border-b border-black/10 dark:border-white/10 bg-transparent rounded-none px-0 text-xl font-bold uppercase placeholder:text-slate-300 focus-visible:ring-0 focus-visible:border-blue-600 transition-colors h-14"
                    />
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                     <Button 
                        variant="outline" 
                        className="lg:hidden flex-1 h-12 rounded-none border-black/10 dark:border-white/10 uppercase font-bold tracking-wider"
                        onClick={() => setShowMobileFilters(true)}
                     >
                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                     </Button>
                     
                     <div className="hidden lg:flex items-center gap-4">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-12 bg-transparent border border-black/10 dark:border-white/10 px-4 font-mono text-xs uppercase focus:outline-none hover:border-black dark:hover:border-white transition-colors"
                        >
                            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <div className="flex border border-black/10 dark:border-white/10">
                            <button onClick={() => setViewMode('grid')} className={`h-12 w-12 flex items-center justify-center ${viewMode === 'grid' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <Grid className="h-4 w-4" />
                            </button>
                            <div className="w-[1px] bg-black/10 dark:bg-white/10" />
                            <button onClick={() => setViewMode('list')} className={`h-12 w-12 flex items-center justify-center ${viewMode === 'list' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                     </div>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* DESKTOP FILTERS (Sticky) */}
            <div className="hidden lg:block col-span-3 space-y-12">
                <div className="sticky top-32 space-y-10">
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                             <MapPin className="w-3 h-3" /> Location
                        </h3>
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                             {locations.map(loc => (
                                <button 
                                  key={loc}
                                  onClick={() => setSelectedLocation(loc)}
                                  className={`block w-full text-left text-sm py-1 transition-colors ${selectedLocation === loc ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}
                                >
                                    {loc}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                             <Award className="w-3 h-3" /> Specialization
                        </h3>
                        <div className="flex flex-wrap gap-2">
                              {specialtiesOptions.map(spec => (
                                <button 
                                  key={spec}
                                  onClick={() => toggleSpecialty(spec)}
                                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider border transition-all ${
                                    selectedSpecialties.includes(spec) 
                                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' 
                                    : 'border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white text-slate-500 hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  {spec}
                                </button>
                              ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <Button 
                            variant="ghost" 
                            onClick={clearFilters}
                            className="w-full justify-start px-0 text-red-500 hover:text-red-600 hover:bg-transparent uppercase text-xs font-bold tracking-widest"
                        >
                            [ Clear All Filters ]
                        </Button>
                    )}
                </div>
            </div>

            {/* RESULTS GRID */}
            <div className="col-span-1 lg:col-span-9">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Loading Directory...</span>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10">
                        <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold uppercase mb-2">No Studios Found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your filter criteria.</p>
                        <Button onClick={clearFilters} variant="outline" className="rounded-none uppercase font-bold tracking-wider">
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12" : "space-y-4"}>
                        {companies.map((company, index) => (
                            <Link href={`/firma/${company.id}`} key={company.id} className={`group block ${viewMode === 'list' ? 'flex gap-6 items-center border-b border-black/10 dark:border-white/10 pb-6' : ''}`}>
                                
                                {/* Image Container */}
                                <div className={`relative overflow-hidden bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 ${viewMode === 'grid' ? 'aspect-[4/3] mb-5' : 'w-48 h-32 shrink-0'}`}>
                                     <Image 
                                        src={getCoverImage(company.id)}
                                        alt={company.company_name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                     />
                                     <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                                     
                                     {/* Overlay Badge */}
                                     {company.is_verified && (
                                         <div className="absolute top-2 right-2">
                                            <Badge className="bg-blue-600 text-white border-none rounded-none text-[8px] font-black uppercase tracking-widest px-2">
                                                Verified
                                            </Badge>
                                         </div>
                                     )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={`font-black uppercase italic leading-none group-hover:text-blue-600 transition-colors truncate pr-4 ${viewMode === 'grid' ? 'text-2xl' : 'text-3xl'}`}>
                                            {company.company_name}
                                        </h3>
                                        {viewMode === 'list' && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                                                <ArrowUpRight className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                                         {company.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-blue-600" /> {company.location}
                                            </span>
                                         )}
                                         <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-blue-600" /> {company.rating.toFixed(1)}
                                         </span>
                                         <span>
                                            {company.projectCount} Projects
                                         </span>
                                    </div>

                                    {/* Specialties (Grid Only) */}
                                    {viewMode === 'grid' && company.specializations.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            {company.specializations.slice(0, 3).map(spec => (
                                                <span key={spec} className="text-[9px] uppercase border border-black/10 dark:border-white/10 px-2 py-0.5 text-slate-500">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Load More */}
                {!isLoading && companies.length > 0 && hasMore && (
                    <div className="mt-20 text-center">
                        <Button 
                            variant="outline" 
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="h-16 px-12 rounded-none border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black uppercase font-black tracking-widest transition-all"
                        >
                            {isLoadingMore ? <Loader2 className="animate-spin w-4 h-4" /> : "Load More Studios"}
                        </Button>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}