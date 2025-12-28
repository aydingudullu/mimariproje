"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ahmet Kaya",
    role: "Müteahhit",
    company: "Kaya İnşaat",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    content: "Mimariproje.com sayesinde projelerimiz için en uygun mimarları bulabiliyorum. Platform çok kullanıcı dostu ve güvenli.",
    project: "Villa Projesi"
  },
  {
    id: 2,
    name: "Zeynep Demir",
    role: "Ev Sahibi",
    company: "Özel Müşteri",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    content: "Evimizin iç mimari tasarımı için harika bir mimar buldum. Süreç baştan sona çok profesyonel ve güvenli geçti.",
    project: "İç Mimari Tasarım"
  },
  {
    id: 3,
    name: "Mehmet Özkan",
    role: "Serbest Mimar",
    company: "Özkan Mimarlık",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    content: "Platform sayesinde portföyümü sergiliyor ve sürekli yeni müşteriler bulabiliyorum. Komisyon oranları da çok makul.",
    project: "Freelance Hizmet"
  },
  {
    id: 4,
    name: "Fatma Yılmaz",
    role: "Mimar",
    company: "Yılmaz Mimarlık",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    content: "Hazır projelerimi satarak ek gelir elde ediyorum. Güvenli ödeme sistemi ve kaliteli müşteriler için teşekkürler.",
    project: "Proje Satışı"
  },
  {
    id: 5,
    name: "Can Demir",
    role: "İş Sahibi",
    company: "Demir Holding",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    content: "Ofis tasarımımız için mükemmel bir firma bulduk. Proje zamanında teslim edildi ve beklentilerimizi aştı.",
    project: "Ofis Tasarımı"
  },
  {
    id: 6,
    name: "Ayşe Kara",
    role: "Restoran Sahibi",
    company: "Kara Restoran",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
    content: "Restoranımın tasarımı için platform üzerinden bulduğum mimar ile harika bir çalışma gerçekleştirdik.",
    project: "Restoran Tasarımı"
  }
];

export function Testimonials() {
  return (
    <section className="py-16 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Müşteri Yorumları
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Binlerce memnun müşterimizin deneyimlerini okuyun
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Quote className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-4">
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center space-x-3">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-slate-500">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Project Type */}
                <div className="text-center mt-4">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                    {testimonial.project}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Ortalama Müşteri Memnuniyeti</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Memnun Müşteri</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Güvenli İşlem Oranı</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}