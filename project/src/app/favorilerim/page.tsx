'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, Eye, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Favorite {
  id: number;
  favorited_at: string;
  project_id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  style: string;
  status: string;
  views: number;
  likes: number;
  primary_image: string;
  owner_id: number;
  owner_first_name: string;
  owner_last_name: string;
  owner_company: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/giris?redirect=/favorilerim');
      return;
    }

    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('mimariproje_access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Favoriler yüklenemedi');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (projectId: number) => {
    try {
      setRemovingId(projectId);
      const token = localStorage.getItem('mimariproje_access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Favoriden çıkarılamadı');
      }

      setFavorites(favorites.filter(f => f.project_id !== projectId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Favorilerim
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Kaydettiğiniz projeler ({favorites.length})
            </p>
          </div>
          <Heart className="h-8 w-8 text-red-500" />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Henüz favori projeniz yok
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Beğendiğiniz projeleri favorilere ekleyerek daha sonra kolayca erişebilirsiniz.
              </p>
              <Link href="/projeler">
                <Button>Projeleri Keşfet</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={favorite.primary_image || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={favorite.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFavorite(favorite.project_id)}
                      disabled={removingId === favorite.project_id}
                    >
                      {removingId === favorite.project_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge>{favorite.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Link href={`/proje/${favorite.project_id}`}>
                    <h3 className="font-semibold text-slate-900 dark:text-white hover:text-primary line-clamp-2 mb-2">
                      {favorite.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {favorite.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {favorite.location || 'Türkiye'}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {favorite.views || 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₺{favorite.price?.toLocaleString()}
                    </span>
                    <Link href={`/proje/${favorite.project_id}`}>
                      <Button size="sm">İncele</Button>
                    </Link>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-slate-500">
                    {favorite.owner_company || `${favorite.owner_first_name} ${favorite.owner_last_name}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
