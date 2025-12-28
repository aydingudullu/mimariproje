"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Eye, Heart, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const featuredProjects = [
  {
    id: 1,
    title: "Modern Villa Tasarımı",
    description: "350m² lüks villa projesi, çağdaş mimari tarzda tasarlanmış.",
    price: "₺15,000",
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600",
    architect: {
      name: "Ahmet Yılmaz",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4.9,
      reviews: 87
    },
    category: "Villa",
    location: "İstanbul",
    views: 1234,
    saves: 89,
    featured: true
  },
  {
    id: 2,
    title: "Çağdaş Apartman Projesi",
    description: "12 daireli apartman projesi, enerji verimli tasarım.",
    price: "₺25,000",
    image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600",
    architect: {
      name: "Zeynep Kara",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4.8,
      reviews: 156
    },
    category: "Apartman",
    location: "Ankara",
    views: 2156,
    saves: 145,
    featured: true
  },
  {
    id: 3,
    title: "Minimalist Ofis Tasarımı",
    description: "500m² ofis alanı, açık plan ve modern tasarım.",
    price: "₺18,500",
    image: "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=600",
    architect: {
      name: "Mehmet Özkan",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4.7,
      reviews: 92
    },
    category: "Ofis",
    location: "İzmir",
    views: 987,
    saves: 67,
    featured: true
  },
  {
    id: 4,
    title: "Geleneksel Ev Restorasyonu",
    description: "Tarihi ev restorasyonu, modern konfor ile geleneksel mimarinin buluşması.",
    price: "₺12,000",
    image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600",
    architect: {
      name: "Fatma Demir",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4.9,
      reviews: 203
    },
    category: "Restorasyon",
    location: "Bursa",
    views: 1567,
    saves: 234,
    featured: true
  }
];

export function FeaturedListings() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Öne Çıkan Projeler
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            En popüler ve yüksek kaliteli mimari projelerimizi keşfedin
          </p>
        </div>

        {/* Featured Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProjects.map((project) => (
            <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">
                    Öne Çıkan
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {project.price}
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">
                    {project.category}
                  </Badge>
                  <div className="flex items-center text-xs text-slate-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {project.location}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {project.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Architect Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.architect.avatar} />
                      <AvatarFallback>{project.architect.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{project.architect.name}</p>
                      <div className="flex items-center text-xs text-slate-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {project.architect.rating} ({project.architect.reviews})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-xs text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {project.views.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {project.saves}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    2 gün önce
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  Detayları Gör
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/projeler">
              Tüm Projeleri Gör
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}