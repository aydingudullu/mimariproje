/**
 * Mimariproje.com - Yeni Proje Ekleme Sayfası
 * Kullanıcıların yeni proje ekleyebileceği sayfa
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, Save, ArrowLeft } from "lucide-react";

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

import { PROJECT_CATEGORIES } from "@/lib/validations";

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
  "Konut",
  "Ofis",
  "Otel",
  "Restoran",
  "Mağaza",
  "Hastane",
  "Okul",
  "Müze",
  "Spor Kompleksi",
  "Havalimanı",
];

import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function YeniProjePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/giris?redirect=/projeler/yeni");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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

  const handleSpecializationToggle = (spec: string) => {
    const current = watchedSpecializations || [];
    if (current.includes(spec)) {
      setValue(
        "specializations",
        current.filter((s) => s !== spec)
      );
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
    // Client-side validasyon
    if (!data.title || !data.description || !data.category || !data.price) {
      alert("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setIsSubmitting(true);
    try {
      // Form verilerini hazırla
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("location", data.location || "");
      formData.append("area", data.area || "");
      formData.append("style", data.style || "");
      formData.append(
        "specializations",
        JSON.stringify(data.specializations || [])
      );

      // Resimleri ekle
      selectedImages.forEach((image, index) => {
        formData.append(`images`, image);
      });

      // Get auth token from localStorage
      const token = localStorage.getItem("mimariproje_access_token");
      if (!token) {
        alert("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        router.push("/auth/giris?redirect=/projeler/yeni");
        return;
      }

      console.log("DEBUG: Frontend Sending Images:", selectedImages.length);

      // XHR ile API'ye gönder (Progress bar için)
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
            try {
               const response = JSON.parse(xhr.responseText);
               if (response.success) {
                   alert("Proje başarıyla eklendi!");
                   router.push("/projeler");
               } else {
                   // Backend başarısız döndü
                   const errorMsg = response.error || "İşlem başarısız";
                   alert(`Hata: ${errorMsg}`);
               }
            } catch (e: any) {
               console.error("Response Parse Error:", e);
               alert("Sunucu cevabı anlaşılamadı.");
            }
         } else {
             try {
                const error = JSON.parse(xhr.responseText);
                console.error("Proje ekleme hatası:", error);
                let errorMessage = error.error || error.message || "Proje eklenirken bir hata oluştu";
                if (error.details && Array.isArray(error.details)) {
                   errorMessage += "\n\nDetaylar:\n" + error.details.map((d: any) => `- ${d.path?.join('.')} : ${d.message}`).join('\n');
                }
                alert(`Hata: ${errorMessage}`);
             } catch {
                alert(`Sunucu Hatası: ${xhr.status}`);
             }
         }
         setUploadProgress(0);
      };
      
      xhr.onerror = () => {
         console.error("XHR Network Error");
         alert("Ağ hatası oluştu. Lütfen bağlantınızı kontrol edin.");
         setIsSubmitting(false);
         setUploadProgress(0);
      };
      
      xhr.send(formData);
    } catch (error: any) {
      console.error("Ön hazırlık hatası:", error);
      alert("Hata: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Proje Ekle</h1>
        <p className="text-gray-600 mt-2">
          Yeni bir proje ekleyerek portföyünüzü genişletin
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Temel Bilgiler
            </CardTitle>
            <CardDescription>
              Projenizin temel bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Proje Başlığı *</Label>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Proje başlığı gereklidir",
                  })}
                  placeholder="Örn: Modern Villa Projesi"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Proje Açıklaması *</Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Proje açıklaması gereklidir",
                })}
                placeholder="Projenizi detaylı olarak açıklayın..."
                rows={4}
                className="mt-1"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fiyat ve Konum */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyat ve Konum</CardTitle>
            <CardDescription>
              Projenizin fiyat bilgileri ve konumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Fiyat (TL) *</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { required: "Fiyat gereklidir" })}
                  placeholder="0"
                  className="mt-1"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Konum</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Örn: İstanbul, Beşiktaş"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="area">Alan (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  {...register("area")}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasarım Detayları */}
        <Card>
          <CardHeader>
            <CardTitle>Tasarım Detayları</CardTitle>
            <CardDescription>Projenizin tasarım özellikleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="style">Tasarım Stili</Label>
              <Select onValueChange={(value) => setValue("style", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Stil seçin" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Uzmanlık Alanları</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {specializations.map((spec) => (
                  <label key={spec} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={watchedSpecializations?.includes(spec) || false}
                      onChange={() => handleSpecializationToggle(spec)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{spec}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resim Yükleme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Proje Resimleri
            </CardTitle>
            <CardDescription>
              Projenizi gösteren resimler ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Resim Seç</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1"
              />
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Proje resmi ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isSubmitting && uploadProgress > 0 && (
          <div className="mb-4">
             <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
               <span>Yükleniyor...</span>
               <span>{uploadProgress}%</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2.5">
               <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
             </div>
          </div>
        )}
        {/* Progress Bar */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="mb-4 space-y-1">
             <div className="flex justify-between text-sm text-gray-600 font-medium">
               <span>Yükleniyor...</span>
               <span>{uploadProgress}%</span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
               <div 
                 className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" 
                 style={{ width: `${uploadProgress}%` }}
               ></div>
             </div>
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              "Kaydediliyor..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Projeyi Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
