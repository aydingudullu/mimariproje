"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
    ArrowLeft, 
    Upload, 
    Save, 
    Layers, 
    MapPin, 
    DollarSign, 
    Maximize, 
    Tag, 
    FileText, 
    Check, 
    X, 
    Loader2 
} from "lucide-react";
import { PROJECT_CATEGORIES } from "@/lib/validations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categories = PROJECT_CATEGORIES;

const styles = [
  { value: "modern", label: "Modern" },
  { value: "klasik", label: "Klasik" },
  { value: "minimalist", label: "Minimalist" },
  { value: "endustriyel", label: "Endüstriyel" },
  { value: "skandinav", label: "Skandinav" },
  { value: "akdeniz", label: "Akdeniz" },
  { value: "osmanli", label: "Osmanlı" },
  { value: "diger", label: "Diğer" },
];

const specializations = [
  "Konut", "Ofis", "Otel", "Restoran", "Mağaza", 
  "Hastane", "Okul", "Müze", "Spor Kompleksi", "Havalimanı"
];

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  location: string;
  area: string;
  style: string;
  specializations: string[];
}

export default function YeniProjePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      location: "",
      area: "",
      style: "",
      specializations: [],
    },
    mode: "onChange",
  });

  const watchedSpecializations = watch("specializations", []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/giris?redirect=/projeler/yeni");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSpecializationToggle = (spec: string) => {
    const current = watchedSpecializations || [];
    if (current.includes(spec)) {
      setValue("specializations", current.filter((s) => s !== spec));
    } else {
      setValue("specializations", [...current, spec]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!data.title || !data.description || !data.category || !data.price) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'specializations') {
             formData.append(key, JSON.stringify(value));
        } else {
             formData.append(key, value as string);
        }
      });

      selectedImages.forEach((image) => {
        formData.append(`images`, image);
      });

      const token = localStorage.getItem("mimariproje_access_token");
      if (!token) {
        toast.error("Oturum süreniz dolmuş.");
        router.push("/auth/giris?redirect=/projeler/yeni");
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/projects", true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };
      
      xhr.onload = () => {
         setIsSubmitting(false);
         if (xhr.status >= 200 && xhr.status < 300) {
            toast.success("Proje başarıyla oluşturuldu.");
            router.push("/projeler");
         } else {
             try {
                const error = JSON.parse(xhr.responseText);
                toast.error(error.message || "Proje oluşturulamadı.");
             } catch {
                toast.error("Sunucu hatası.");
             }
         }
         setUploadProgress(0);
      };
      
      xhr.onerror = () => {
         toast.error("Ağ hatası.");
         setIsSubmitting(false);
         setUploadProgress(0);
      };
      
      xhr.send(formData);
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] text-white font-sans selection:bg-blue-900 selection:text-white">
      
      {/* LEFT PANEL - FORM */}
      <div className="relative p-6 lg:p-12 pt-32 lg:pt-40 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-12">
            
            {/* Header */}
            <div>
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="pl-0 hover:bg-transparent text-zinc-500 hover:text-white mb-6 uppercase tracking-widest text-[10px] font-mono group"
                >
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Abort / Return
                </Button>
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-2">
                    Project<br /><span className="text-blue-600">Spec_Sheet.</span>
                </h1>
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-wide">
                    Initiate new architectural project protocol.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                
                {/* SECTION 1: CORE DATA */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-2">
                        <FileText className="w-3 h-3" /> 01 // Core Data
                    </div>
                    
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-blue-500 transition-colors">Project Title</label>
                            <Input
                                {...register("title", { required: true })}
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none px-0 py-2 text-xl font-bold font-mono focus-visible:ring-0 focus-visible:border-blue-600 transition-all placeholder:text-zinc-800"
                                placeholder="ENTER PROJECT NAME"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="group">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-blue-500 transition-colors">Category</label>
                                <Select onValueChange={(v) => setValue("category", v)}>
                                    <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none px-0 py-2 h-auto text-sm font-mono focus:ring-0 focus:border-blue-600">
                                        <SelectValue placeholder="SELECT TYPE" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                        {categories.map((c) => (
                                            <SelectItem key={c.value} value={c.value} className="focus:bg-blue-900 focus:text-white font-mono text-xs uppercase">
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="group">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-blue-500 transition-colors">Style</label>
                                <Select onValueChange={(v) => setValue("style", v)}>
                                    <SelectTrigger className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none px-0 py-2 h-auto text-sm font-mono focus:ring-0 focus:border-blue-600">
                                        <SelectValue placeholder="SELECT STYLE" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                        {styles.map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="focus:bg-blue-900 focus:text-white font-mono text-xs uppercase">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="group">
                             <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-blue-500 transition-colors">Technical Description</label>
                             <Textarea 
                                {...register("description", { required: true })}
                                className="bg-zinc-900/50 border-zinc-800 rounded-sm focus-visible:ring-1 focus-visible:ring-blue-600 font-mono text-xs p-4 min-h-[120px]"
                                placeholder="// Describe structural details, materials, and design intent..."
                             />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: SPECS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-2">
                         <Layers className="w-3 h-3" /> 02 // Specifications
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-green-500 transition-colors flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Est. Budget
                            </label>
                            <Input
                                type="number"
                                {...register("price", { required: true })}
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none px-0 py-2 text-lg font-mono focus-visible:ring-0 focus-visible:border-green-600 transition-all placeholder:text-zinc-800"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="group">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-yellow-500 transition-colors flex items-center gap-1">
                                <Maximize className="w-3 h-3" /> Area (m²)
                            </label>
                             <Input
                                type="number"
                                {...register("area")}
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none px-0 py-2 text-lg font-mono focus-visible:ring-0 focus-visible:border-yellow-600 transition-all placeholder:text-zinc-800"
                                placeholder="0"
                            />
                        </div>
                         <div className="group">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 group-focus-within:text-purple-500 transition-colors flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Location
                            </label>
                             <Input
                                {...register("location")}
                                className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none px-0 py-2 text-lg font-mono focus-visible:ring-0 focus-visible:border-purple-600 transition-all placeholder:text-zinc-800"
                                placeholder="CITY, TR"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1"><Tag className="w-3 h-3" /> Specializations</label>
                        <div className="flex flex-wrap gap-2">
                            {specializations.map((spec) => (
                                <button
                                    key={spec}
                                    type="button"
                                    onClick={() => handleSpecializationToggle(spec)}
                                    className={cn(
                                        "px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-all",
                                        watchedSpecializations?.includes(spec) 
                                        ? "bg-white text-black border-white" 
                                        : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
                                    )}
                                >
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ASSETS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-2">
                         <Upload className="w-3 h-3" /> 03 // Visual Assets
                    </div>
                    
                    <div className="border border-dashed border-zinc-800 hover:border-blue-600 hover:bg-blue-600/5 transition-all rounded-sm p-8 text-center relative group">
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                         <div className="flex flex-col items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Upload className="w-5 h-5 text-zinc-500 group-hover:text-blue-500" />
                             </div>
                             <div className="space-y-1">
                                 <h4 className="text-sm font-bold uppercase tracking-tight">Upload Renderings</h4>
                                 <p className="text-xs font-mono text-zinc-500">Drag & drop or click to browse</p>
                             </div>
                         </div>
                    </div>

                    {selectedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                             {selectedImages.map((file, i) => (
                                 <div key={i} className="relative aspect-square bg-zinc-900 border border-zinc-800 group overflow-hidden">
                                     <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                     <button 
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center hover:bg-red-600 z-20"
                                     >
                                         <X className="w-3 h-3" />
                                     </button>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="pt-8 flex items-center justify-between border-t border-zinc-800">
                    {uploadProgress > 0 && (
                        <div className="flex flex-col gap-1 w-1/2">
                            <div className="flex justify-between text-[10px] font-mono uppercase text-blue-500">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1 bg-zinc-900 w-full">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="ml-auto bg-white text-black hover:bg-blue-600 hover:text-white rounded-sm text-xs font-black uppercase tracking-widest h-12 px-8"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Project"}
                    </Button>
                </div>
            </form>
        </div>
      </div>

      {/* RIGHT PANEL - DECORATIVE */}
      <div className="hidden lg:flex flex-col relative bg-zinc-900/50 border-l border-white/5 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{
                 backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}
        />

        {/* Floating Elements */}
        <div className="flex-1 flex items-center justify-center p-20">
             <div className="w-full h-full border border-white/10 relative p-8">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
                 <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />
                 
                 <div className="h-full flex flex-col justify-between text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                     <div className="flex justify-between">
                         <span>REF: {new Date().getFullYear()}-001</span>
                         <span>STATUS: DRAFTING</span>
                     </div>
                     <div className="text-center opacity-50">
                         WAITING FOR INPUT...
                     </div>
                     <div className="flex justify-between">
                          <span>SCALE: 1:1</span>
                          <span>SECTOR: A-1</span>
                     </div>
                 </div>
             </div>
        </div>
      </div>

    </div>
  );
}
