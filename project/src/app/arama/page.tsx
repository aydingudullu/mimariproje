import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter,
  MapPin,
  Star,
  Eye,
  Heart,
  Building2,
  User,
  Briefcase,
  TrendingUp,
  Clock,
  SlidersHorizontal,
  X
} from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Arama Sonuçları - Mimariproje.com",
  description: "Gelişmiş arama ve filtreleme ile istediğiniz projeleri ve uzmanları bulun.",
};

const searchResults = {
  projects: [
    {
      id: 1,
      title: "Modern Villa Tasarımı",
      description: "350m² lüks villa projesi, çağdaş mimari tarzda tasarlanmış.",
      price: "₺15,000",
      image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400",
      architect: "Ahmet Yılmaz",
      rating: 4.9,
      views: 1234,
      category: "Villa",
      location: "İstanbul"
    },
    {
      id: 2,
      title: "Çağdaş Apartman Projesi",
      description: "12 daireli apartman projesi, enerji verimli tasarım.",
      price: "₺25,000",
      image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400",
      architect: "Zeynep Kara",
      rating: 4.8,
      views: 2156,
      category: "Apartman",
      location: "Ankara"
    }
  ],
  architects: [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      title: "Serbest Mimar",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4.9,
      reviews: 87,
      projects: 156,
      location: "İstanbul",
      specialties: ["Villa Tasarımı", "Modern Mimari"]
    },
    {
      id: 2,
      name: "Zeynep Kara",
      title: "İç Mimar",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4.8,
      reviews: 156,
      projects: 234,
      location: "Ankara",
      specialties: ["İç Mimari", "Sürdürülebilir Tasarım"]
    }
  ],
  companies: [
    {
      id: 1,
      name: "Yılmaz Mimarlık",
      logo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      employees: "25-50",
      rating: 4.8,
      projects: 234,
      location: "İstanbul",
      specialties: ["Konut Projeleri", "Ticari Mimari"]
    }
  ]
};

const activeFilters = [
  { type: "category", value: "Villa", label: "Villa" },
  { type: "location", value: "istanbul", label: "İstanbul" },
  { type: "price", value: "10000-20000", label: "₺10,000 - ₺20,000" }
];

const popularSearches = [
  "villa tasarımı",
  "modern ev",
  "iç mimari",
  "apartman projesi",
  "ofis tasarımı",
  "restorasyon",
  "peyzaj mimarlığı",
  "3d modelleme"
];

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Proje, mimar veya firma arayın..."
                className="pl-12 h-12 text-lg"
                defaultValue="villa tasarımı"
              />
            </div>
            <Button size="lg" className="px-8">
              <Search className="h-5 w-5 mr-2" />
              Ara
            </Button>
            <Button variant="outline" size="lg">
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filtreler
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-slate-600 dark:text-slate-300 mr-2">Aktif filtreler:</span>
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {filter.label}
                  <X className="h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-xs">
                Tümünü Temizle
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Gelişmiş Filtreler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Type */}
                <div>
                  <h3 className="font-semibold mb-3">Arama Türü</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="searchType" value="all" defaultChecked />
                      <span className="text-sm">Tümü</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="searchType" value="projects" />
                      <span className="text-sm">Projeler</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="searchType" value="architects" />
                      <span className="text-sm">Mimarlar</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="searchType" value="companies" />
                      <span className="text-sm">Firmalar</span>
                    </label>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="font-semibold mb-3">Kategori</h3>
                  <div className="space-y-2">
                    {["Villa", "Apartman", "Ofis", "Konut", "İç Mimari", "Peyzaj"].map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Fiyat Aralığı</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Min ₺" type="number" />
                      <Input placeholder="Max ₺" type="number" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold mb-3">Konum</h3>
                  <div className="space-y-2">
                    {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"].map((location) => (
                      <label key={location} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-semibold mb-3">Minimum Puan</h3>
                  <div className="space-y-2">
                    {[5, 4, 3].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" />
                        <div className="flex items-center">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm ml-1">ve üzeri</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Searches */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Popüler Aramalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Badge key={search} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {search}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Arama Sonuçları
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  "villa tasarımı" için <span className="font-semibold">247</span> sonuç bulundu
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Sırala:</span>
                <select className="border rounded px-3 py-1 text-sm">
                  <option>En İlgili</option>
                  <option>En Yeni</option>
                  <option>En Popüler</option>
                  <option>Fiyat: Düşük-Yüksek</option>
                  <option>Fiyat: Yüksek-Düşük</option>
                </select>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Projeler ({searchResults.projects.length})
                </h3>
                <Button variant="outline" size="sm">Tümünü Gör</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.projects.map((project) => (
                  <Card key={project.id} className="group hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge>{project.category}</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {project.price}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {project.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {project.location}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {project.views}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {project.rating}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Architects Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Mimarlar ({searchResults.architects.length})
                </h3>
                <Button variant="outline" size="sm">Tümünü Gör</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.architects.map((architect) => (
                  <Card key={architect.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={architect.avatar} />
                          <AvatarFallback>{architect.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {architect.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                            {architect.title}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {architect.rating} ({architect.reviews})
                            </div>
                            <div>{architect.projects} proje</div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {architect.location}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {architect.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Companies Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Firmalar ({searchResults.companies.length})
                </h3>
                <Button variant="outline" size="sm">Tümünü Gör</Button>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {searchResults.companies.map((company) => (
                  <Card key={company.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={company.logo} />
                          <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {company.name}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <div>{company.employees} çalışan</div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {company.rating}
                            </div>
                            <div>{company.projects} proje</div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {company.location}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {company.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <Button variant="outline" disabled>Önceki</Button>
                <Button variant="outline" className="bg-primary text-white">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Sonraki</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}