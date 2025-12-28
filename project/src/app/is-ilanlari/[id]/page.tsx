'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  Building2,
  Users,
  Briefcase,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  ArrowUpRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FormModal, AlertModal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { tokenManager } from '@/lib/api';

// API Configuration
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

interface JobDetail {
  id: number;
  title: string;
  description: string;
  requirements: string;
  job_type: string;
  location: string;
  salary_min: string | number;
  salary_max: string | number;
  salary_currency: string;
  experience_level: string;
  category: string;
  status: string;
  featured: boolean;
  remote_allowed: boolean;
  created_at: string;
  expires_at: string;
  users: {
    id: number;
    first_name: string;
    last_name: string;
    company_name: string;
    profile_image_url: string | null;
    location: string | null;
    email: string;
  };
  _count: {
    job_applications: number;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/jobs/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch job details');
        const data = await response.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
        fetchJob();
    }
  }, [params.id]);

  const handleApplyClick = () => {
      if (!isAuthenticated) {
          router.push('/auth/giris');
          return;
      }
      setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
      if (!job) return;
      try {
          setIsSubmitting(true);
          const response = await fetch(`${API_URL}/api/jobs/applications`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokenManager.getAccessToken()}`
              },
              body: JSON.stringify({
                  job_id: job.id,
                  cover_letter: coverLetter
              })
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to submit application');
          }

          setIsApplyModalOpen(false);
          setIsSuccessModalOpen(true);
          setCoverLetter('');
      } catch (err: any) {
          alert('Error submitting application: ' + err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );
  }

  if (error || !job) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
            <h1 className="text-2xl font-black uppercase mb-4">Job Not Found</h1>
            <Link href="/is-ilanlari">
                <Button variant="outline" className="rounded-none uppercase">Back to Listings</Button>
            </Link>
        </div>
    );
  }

  const formatSalary = (min: string | number, max: string | number, currency: string = 'TRY') => {
    if (!min && !max) return 'Hidden';
    return `${Number(min).toLocaleString()} - ${Number(max).toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white pt-24">
      
      {/* HEADER HERO */}
      <div className="relative border-b border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-20 px-6">
          <div className="container mx-auto">
                <Link href="/is-ilanlari" className="inline-flex items-center text-xs font-mono uppercase text-slate-500 mb-8 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Back to listings
                </Link>

                <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    <div className="flex-1">
                         <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16 md:h-20 md:w-20 rounded-none border border-black/10 dark:border-white/10">
                                <AvatarImage src={job.users.profile_image_url || undefined} />
                                <AvatarFallback className="rounded-none bg-black text-white dark:bg-white dark:text-black font-black text-2xl">
                                    {job.users.company_name ? job.users.company_name.charAt(0) : 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-[0.9] tracking-tighter mb-2">
                                    {job.title}
                                </h1>
                                <Link href={`/firma/${job.users.id}`} className="text-lg md:text-xl font-mono uppercase border-b border-black/20 dark:border-white/20 hover:text-blue-600 hover:border-blue-600 transition-colors">
                                    {job.users.company_name || 'Anonymous Studio'}
                                </Link>
                            </div>
                         </div>

                         <div className="flex flex-wrap gap-4 md:gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                             <div className="flex items-center gap-2">
                                 <MapPin className="w-4 h-4 text-blue-600" />
                                 {job.location}
                             </div>
                             <div className="flex items-center gap-2">
                                 <Building2 className="w-4 h-4 text-blue-600" />
                                 {job.job_type}
                             </div>
                             <div className="flex items-center gap-2">
                                 <Clock className="w-4 h-4 text-blue-600" />
                                 Posted on {formatDate(job.created_at)}
                             </div>
                         </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                        <Button onClick={handleApplyClick} className="h-14 rounded-none bg-blue-600 hover:bg-black dark:hover:bg-white dark:hover:text-black text-white uppercase font-black tracking-widest text-sm transition-colors w-full">
                            Apply for Role
                        </Button>
                        <div className="flex gap-4">
                             <Button variant="outline" className="flex-1 h-12 rounded-none border-black/10 dark:border-white/10 uppercase font-bold tracking-wider">
                                <Share2 className="w-4 h-4" />
                             </Button>
                             <Button variant="outline" className="flex-1 h-12 rounded-none border-black/10 dark:border-white/10 uppercase font-bold tracking-wider">
                                <BookmarkPlus className="w-4 h-4" />
                             </Button>
                        </div>
                    </div>
                </div>
          </div>
      </div>

      <div className="container mx-auto px-6 py-20 pb-40">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
               
               {/* MAIN CONTENT */}
               <div className="lg:col-span-8 space-y-16">
                   
                   {/* Description */}
                   <section>
                       <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                           <ShieldCheck className="w-5 h-5 text-blue-600" /> Role Description
                       </h2>
                       <div className="font-serif text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                           {job.description.split('\n').map((line, i) => (
                               <p key={i} className="mb-4">{line}</p>
                           ))}
                       </div>
                   </section>

                   {/* Requirements */}
                   <section>
                       <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                           <ShieldCheck className="w-5 h-5 text-blue-600" /> Requirements
                       </h2>
                       <div className="bg-slate-50 dark:bg-white/5 p-8 border border-black/5 dark:border-white/5">
                           <div className="font-mono text-sm leading-relaxed whitespace-pre-line">
                               {job.requirements}
                           </div>
                       </div>
                   </section>

               </div>

               {/* SIDEBAR */}
               <div className="lg:col-span-4 space-y-12">
                   
                   <div className="p-8 border border-black/10 dark:border-white/10 space-y-8 bg-white dark:bg-[#0a0a0a]">
                       <h3 className="font-black uppercase tracking-widest text-xs pb-4 border-b border-black/10 dark:border-white/10">
                           Job Specs
                       </h3>
                       
                       <div className="space-y-6">
                           <div>
                               <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Salary Range</span>
                               <span className="text-xl font-bold font-mono block">
                                   {formatSalary(job.salary_min, job.salary_max)}
                               </span>
                           </div>
                           
                           <div>
                               <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Experience Level</span>
                               <span className="text-lg font-bold uppercase block">
                                   {job.experience_level || 'Not Specified'}
                               </span>
                           </div>

                           <div>
                               <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Remote Policy</span>
                               <span className="text-lg font-bold uppercase block flex items-center gap-2">
                                   {job.remote_allowed ? (
                                       <><Users className="w-4 h-4 text-green-500" /> Remote Allowed</>
                                   ) : (
                                       <><Building2 className="w-4 h-4 text-slate-500" /> On-site Only</>
                                   )}
                               </span>
                           </div>

                           <div>
                               <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Applications</span>
                               <span className="text-lg font-bold font-mono block">
                                   {job._count.job_applications} Applicants
                               </span>
                           </div>
                       </div>
                   </div>

                   {/* Company Card */}
                   <div className="p-8 bg-black dark:bg-white text-white dark:text-black">
                       <h3 className="font-black uppercase tracking-widest text-xs mb-6 opacity-50">
                           About The Studio
                       </h3>
                       <div className="flex items-center gap-4 mb-6">
                           <Avatar className="h-12 w-12 rounded-none border border-white/20 dark:border-black/20">
                                <AvatarImage src={job.users.profile_image_url || undefined} />
                                <AvatarFallback className="rounded-none bg-white text-black dark:bg-black dark:text-white font-bold">
                                    {job.users.company_name ? job.users.company_name.charAt(0) : 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-bold uppercase text-lg leading-none mb-1">{job.users.company_name}</h4>
                                <span className="font-mono text-xs opacity-70">{job.users.location || 'Turkey'}</span>
                            </div>
                       </div>
                       <Link href={`/firma/${job.users.id}`}>
                           <Button variant="outline" className="w-full rounded-none border-white/20 dark:border-black/20 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white uppercase font-bold text-xs">
                               View Studio Profile <ArrowUpRight className="w-3 h-3 ml-2" />
                           </Button>
                       </Link>
                   </div>

               </div>
           </div>
      </div>

      <FormModal 
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply for ${job.title}`}
          description={`Submit your application to ${job.users.company_name}`}
          submitText="Submit Application"
          onSubmit={handleSubmitApplication}
          isLoading={isSubmitting}
      >
          <div className="space-y-4">
              <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest block">Cover Letter</span>
                  <Textarea 
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Why are you a good fit for this role?"
                      className="min-h-[150px] resize-none"
                  />
              </div>
          </div>
      </FormModal>

      <AlertModal 
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="Application Submitted"
          message="Your application has been successfully sent to the studio."
          type="success"
      />

    </div>
  );
}
