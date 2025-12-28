"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Grid3X3,
  List,
  Star,
  Loader2,
  Plus,
  ArrowUpDown,
  Check,
  X,
  SlidersHorizontal
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PROJECT_CATEGORIES, CITIES } from "@/lib/validations";
import type { Project } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCardAvantGarde } from "@/components/projects/project-card-avant-garde";

interface ProjectFilters {
  search: string;
  category: string;
  location: string;
  min_price: string;
  max_price: string;
  sort_by: string;
}

interface ProjectsData {
  projects: Project[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export default function ProjectsPage() {
  const searchParams = useSearchParams();

  const [projectsData, setProjectsData] = useState<ProjectsData>({
    projects: [],
    pagination: {
      page: 1,
      per_page: 12,
      total: 0,
      pages: 0,
    },
  });

  const [filters, setFilters] = useState<ProjectFilters>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    location: searchParams.get("location") || "all",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    sort_by: "newest",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load projects
  const loadProjects = async (page: number = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const params: any = {
        page,
        per_page: 12,
      };

      // Add filters
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.min_price) params.min_price = parseFloat(filters.min_price);
      if (filters.max_price) params.max_price = parseFloat(filters.max_price);

      // Next.js API route kullan
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/projects?${queryString}`);

      if (response.ok) {
        const data = await response.json();
        const projectsList = data.data?.projects || data.projects || [];
        const paginationData = data.data?.pagination || data.pagination || {
          page: 1,
          per_page: 12,
          total: 0,
          pages: 0,
        };
        
        setProjectsData({
          projects: projectsList,
          pagination: paginationData,
        });
      } else {
        setError("Projeler yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Projects load error:", error);
      setError("Bağlantı hatası oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects on component mount and filter changes
  useEffect(() => {
    loadProjects();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
    // "all" değerini boş string olarak işle
    const filterValue = value === "all" ? "" : value;
    setFilters((prev) => ({
      ...prev,
      [key]: filterValue,
    }));
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadProjects(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCategoryLabel = (value: string) => {
    const category = PROJECT_CATEGORIES.find((cat) => cat.value === value);
    return category?.label || value;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 relative">
      {/* Avant-Garde Hero Section */}
      <div className="relative pt-32 pb-16 border-b border-black/5 dark:border-white/5 overflow-hidden z-10">
         {/* Background Grid Lines (Homepage Style) for Hero Only */}
         <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%" className="scale-150">
               <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
               <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
         <div className="container mx-auto px-6 relative z-10 w-full">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
               <div className="w-full lg:w-[65%]">
                  <span className="text-blue-600 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Platform Architecture</span>
                  <h1 className="text-6xl md:text-[5.5rem] font-black italic uppercase tracking-tighter leading-[0.9] text-black dark:text-white pr-4 py-2">
                     Projects <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-black/20 dark:from-white dark:to-white/20">// Archive</span>
                  </h1>
               </div>
               <div className="flex flex-col gap-4 w-full lg:w-auto">
                   <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm font-mono self-end text-right hidden lg:block">
                      DISCOVER CURATED ARCHITECTURAL WORKS FROM TOP PROFESSIONALS. EXPLORE BY STYLE, TYPE AND REGION.
                   </p>
                   <Button asChild className="h-14 px-8 bg-blue-600 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-white rounded-none font-black uppercase tracking-widest text-xs transition-all w-full lg:w-auto">
                      <Link href="/projeler/yeni">
                         <Plus className="h-4 w-4 mr-2" />
                         Submit Project
                      </Link>
                   </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Avant-Garde Sidebar Filters */}
          <div className="lg:w-1/4 space-y-8">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <Input 
                  placeholder="SEARCH ARCHIVE..." 
                  className="pl-12 h-14 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-none text-xs font-bold uppercase tracking-widest text-black dark:text-white focus:ring-0 focus:border-blue-600 transition-colors placeholder:text-slate-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
               />
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-white/10">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Filter By</h3>
                   <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                </div>

                {/* Category */}
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                   <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                      <SelectTrigger className="w-full h-12 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-none text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                         <SelectValue placeholder="ALL CATEGORIES" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0a0a0a] border-black/10 dark:border-white/10">
                         <SelectItem value="all" className="text-xs uppercase tracking-wide focus:bg-black/5 dark:focus:bg-white/10 focus:text-black dark:focus:text-white">All Categories</SelectItem>
                         {PROJECT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="text-xs uppercase tracking-wide focus:bg-black/5 dark:focus:bg-white/10 focus:text-black dark:focus:text-white">
                               {cat.label}
                            </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                 {/* Location */}
                 <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                   <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                      <SelectTrigger className="w-full h-12 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-none text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                         <SelectValue placeholder="ALL LOCATIONS" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0a0a0a] border-black/10 dark:border-white/10">
                         <SelectItem value="all" className="text-xs uppercase tracking-wide focus:bg-black/5 dark:focus:bg-white/10 focus:text-black dark:focus:text-white">All Locations</SelectItem>
                         {CITIES.slice(0, 10).map((city) => (
                            <SelectItem key={city} value={city} className="text-xs uppercase tracking-wide focus:bg-black/5 dark:focus:bg-white/10 focus:text-black dark:focus:text-white">
                               {city}
                            </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>

                {/* Price */}
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget Range</label>
                   <div className="flex gap-2">
                       <Input 
                          placeholder="MIN" 
                          type="number"
                          className="h-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-none text-xs uppercase"
                          value={filters.min_price}
                          onChange={(e) => handleFilterChange("min_price", e.target.value)}
                       />
                       <Input 
                          placeholder="MAX" 
                          type="number"
                          className="h-10 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-none text-xs uppercase"
                          value={filters.max_price}
                          onChange={(e) => handleFilterChange("max_price", e.target.value)}
                       />
                   </div>
                </div>

            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header: Total Count & Sort */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5 dark:border-white/5">
               <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span className="text-black dark:text-white text-lg mr-2">{projectsData.pagination.total}</span> 
                  Results Found
               </div>

               <div className="flex items-center gap-4">
                  <Select value={filters.sort_by} onValueChange={(value) => handleFilterChange("sort_by", value)}>
                      <SelectTrigger className="w-40 h-10 bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wide text-right">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0a0a0a] border-black/10 dark:border-white/10">
                         <SelectItem value="newest" className="text-xs focus:bg-black/5 dark:focus:bg-white/10">Newest First</SelectItem>
                         <SelectItem value="oldest" className="text-xs focus:bg-black/5 dark:focus:bg-white/10">Oldest First</SelectItem>
                         <SelectItem value="popular" className="text-xs focus:bg-black/5 dark:focus:bg-white/10">Most Popular</SelectItem>
                      </SelectContent>
                   </Select>
               </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Retrieving Data...</p>
              </div>
            )}

            {/* Error */}
            {error && (
               <div className="h-64 flex flex-col items-center justify-center border border-dashed border-red-500/20 bg-red-500/5 p-8">
                  <p className="text-red-500 text-sm mb-4 font-mono">{error}</p>
                  <Button variant="outline" onClick={() => loadProjects()} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white uppercase text-xs font-bold tracking-widest">Retry Connection</Button>
               </div>
            )}

            {/* Empty */}
            {!isLoading && !error && projectsData.projects.length === 0 && (
               <div className="h-96 flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest font-bold">No Projects Found matching criteria</p>
                  <Button asChild className="bg-black dark:bg-white text-white dark:text-black hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white rounded-none uppercase text-xs font-black tracking-widest px-8 py-6 transition-all">
                     <Link href="/projeler/yeni">
                        Submit First Project
                     </Link>
                  </Button>
               </div>
            )}

            {/* Grid */}
            {!isLoading && !error && projectsData.projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {projectsData.projects.map((project, index) => (
                  <ProjectCardAvantGarde 
                     key={project.id} 
                     project={project} 
                     index={index} 
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && projectsData.pagination.pages > 1 && (
              <div className="flex justify-center mt-20 gap-2">
                  <Button
                    variant="outline"
                    className="h-12 w-12 p-0 rounded-none border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30"
                    disabled={projectsData.pagination.page === 1}
                    onClick={() => handlePageChange(projectsData.pagination.page - 1)}
                  >
                    ←
                  </Button>

                  {Array.from({ length: Math.min(5, projectsData.pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={projectsData.pagination.page === page ? "default" : "outline"}
                          className={`h-12 w-12 p-0 rounded-none border-black/10 dark:border-white/10 font-bold transition-all ${
                             projectsData.pagination.page === page 
                               ? "bg-blue-600 text-white border-blue-600" 
                               : "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    }
                  )}

                  <Button
                    variant="outline"
                    className="h-12 w-12 p-0 rounded-none border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30"
                    disabled={projectsData.pagination.page === projectsData.pagination.pages}
                    onClick={() => handlePageChange(projectsData.pagination.page + 1)}
                  >
                    →
                  </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
