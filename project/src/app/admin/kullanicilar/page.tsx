'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit,
  UserCheck,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  user_type: string;
  is_verified: boolean;
  subscription_type: string | null;
  created_at: string;
  profile_image_url: string | null;
  _count: { projects: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{open: boolean; userId: number | null}>({open: false, userId: null});
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('mimariproje_access_token');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (userTypeFilter) params.append('user_type', userTypeFilter);

      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(debounce);
  }, [search, userTypeFilter]);

  const handleVerifyUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('mimariproje_access_token');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true } : u));
      }
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.userId) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('mimariproje_access_token');
      const response = await fetch(`${API_URL}/api/admin/users/${deleteModal.userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteModal.userId));
        setDeleteModal({ open: false, userId: null });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform kullanıcılarını yönetin</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="İsim veya email ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <option value="">Tüm Tipler</option>
              <option value="individual">Bireysel</option>
              <option value="company">Firma</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">Kullanıcı</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tip</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">Durum</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">Projeler</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">Kayıt</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name || user.company_name}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {user.user_type === 'individual' ? 'Bireysel' : 
                           user.user_type === 'company' ? 'Firma' : 'Admin'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_verified ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" /> Doğrulandı
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <XCircle className="h-3 w-3 mr-1" /> Beklemede
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400">{user._count.projects}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" /> Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" /> Düzenle
                            </DropdownMenuItem>
                            {!user.is_verified && (
                              <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2" /> Doğrula
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteModal({ open: true, userId: user.id })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Kullanıcı bulunamadı
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500">
                Toplam {pagination.total} kullanıcıdan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, userId: null })}
        onConfirm={handleDeleteUser}
        title="Kullanıcıyı Sil"
        message="Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
