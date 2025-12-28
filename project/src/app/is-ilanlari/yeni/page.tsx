'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { tokenManager } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// API Configuration
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

export default function PostJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
      title: '',
      description: '',
      requirements: '',
      location: '',
      job_type: 'Tam Zamanlı',
      category: 'Mimarlık',
      salary_min: '',
      salary_max: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getAccessToken()}`
        },
        body: JSON.stringify({
            ...formData,
            salary_min: formData.salary_min ? Number(formData.salary_min) : undefined,
            salary_max: formData.salary_max ? Number(formData.salary_max) : undefined
        })
      });

      if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create job');
      }

      router.push('/is-ilanlari');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
              <div className="text-center">
                  <h1 className="text-2xl font-black uppercase mb-4">Authentication Required</h1>
                  <p className="mb-6">Please login to post a job opportunity.</p>
                  <Link href="/auth/giris">
                      <Button className="rounded-none uppercase font-bold">Login</Button>
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
            <Link href="/is-ilanlari" className="inline-flex items-center text-sm font-mono uppercase text-slate-500 mb-8 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
            </Link>

            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-8">
                Post New<br/>Opportunity
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold uppercase border border-red-200 dark:border-red-900/50">
                        Error: {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Job Title</label>
                    <Input 
                        required
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="rounded-none border-black/10 dark:border-white/10 bg-transparent h-12 font-bold uppercase"
                        placeholder="E.G. CHIEF ARCHITECT"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Location</label>
                        <Input 
                            required
                            value={formData.location} 
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            className="rounded-none border-black/10 dark:border-white/10 bg-transparent h-12"
                            placeholder="ISTANBUL, TR"
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Job Type</label>
                        <select 
                            value={formData.job_type}
                            onChange={e => setFormData({...formData, job_type: e.target.value})}
                            className="w-full h-12 rounded-none border border-black/10 dark:border-white/10 bg-transparent px-3 font-mono text-sm uppercase focus:outline-none focus:border-blue-600"
                        >
                            <option>Tam Zamanlı</option>
                            <option>Yarı Zamanlı</option>
                            <option>Sözleşmeli</option>
                            <option>Freelance</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Description</label>
                    <Textarea 
                        required
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="rounded-none border-black/10 dark:border-white/10 bg-transparent min-h-[150px]"
                        placeholder="Describe the role and responsibilities..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Requirements</label>
                    <Textarea 
                        required
                        value={formData.requirements}
                        onChange={e => setFormData({...formData, requirements: e.target.value})}
                        className="rounded-none border-black/10 dark:border-white/10 bg-transparent min-h-[150px]"
                        placeholder="Required skills, experience, and qualifications..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Min Salary</label>
                        <Input 
                            type="number"
                            value={formData.salary_min}
                            onChange={e => setFormData({...formData, salary_min: e.target.value})}
                            className="rounded-none border-black/10 dark:border-white/10 bg-transparent h-12"
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Max Salary</label>
                        <Input 
                            type="number"
                            value={formData.salary_max}
                            onChange={e => setFormData({...formData, salary_max: e.target.value})}
                            className="rounded-none border-black/10 dark:border-white/10 bg-transparent h-12"
                            placeholder="0"
                        />
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 rounded-none bg-blue-600 hover:bg-black dark:hover:bg-white dark:hover:text-black uppercase font-black tracking-widest text-white transition-colors"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Create Opportunity'}
                </Button>
            </form>
        </div>
    </div>
  );
}
