'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Send,
  FileCode,
  AlertOctagon,
  Terminal,
  MousePointer2
} from "lucide-react";
import { AlertModal } from "@/components/ui/modal";

export default function GetQuotePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    projectType: "",
    projectDetails: "",
    budget: "",
    deadline: "",
    fullName: "",
    email: "",
    phone: "",
    location: "",
  });

  const projectTypes = [
    {id: "mimari-tasarim", label: "01 // MIMARI TASARIM"},
    {id: "ic-mimari", label: "02 // IC MIMARI"},
    {id: "peyzaj-mimarligi", label: "03 // PEYZAJ"},
    {id: "restorasyon", label: "04 // RESTORASYON"},
    {id: "proje-yonetimi", label: "05 // PROJE YONETIMI"},
    {id: "3d-modelleme", label: "06 // 3D MODELLEME"},
  ];

  /* 
   * Note: Auth check is currently relaxed to allow viewing the design.
   * In production, uncomment the redirection logic below.
   */
  /*
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/giris?redirect=/teklif-al");
    }
  }, [authLoading, isAuthenticated, router]);
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 font-sans selection:bg-blue-600 selection:text-white">
      
       {/* Background Grid */}
       <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" className="scale-150">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 pt-32 pb-20 container mx-auto px-6">
          
          {/* HERO HEADER */}
          <div className="flex flex-col gap-6 mb-20">
              <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-600 animate-pulse" />
                  <span className="font-mono text-xs text-blue-600 uppercase tracking-widest">
                      Protocol // New Submission
                  </span>
              </div>
              <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mix-blend-difference text-black dark:text-white">
                  Request<br/>
                  <span className="outline-text text-transparent stroke-black dark:stroke-white stroke-2">Proposal</span>
              </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              
              {/* LEFT COLUMN - INSTRUCTIONS */}
              <div className="hidden lg:block lg:col-span-4 space-y-12 sticky top-32 h-fit">
                  <div className="border-t border-black/20 dark:border-white/20 pt-8">
                       <h3 className="font-mono text-sm uppercase font-bold mb-4 flex items-center gap-2">
                           <Terminal className="w-4 h-4" /> System Specs
                       </h3>
                       <p className="font-mono text-xs text-slate-500 leading-relaxed mb-8 uppercase">
                           Please provide detailed specifications for your architectural requirements. All submissions are processed securely through our encrypted protocol.
                       </p>
                       <div className="space-y-4">
                           <div className="flex items-center gap-4 text-xs font-bold uppercase opacity-50">
                               <CheckCircle2 className="w-4 h-4" /> Secure Transmission
                           </div>
                           <div className="flex items-center gap-4 text-xs font-bold uppercase opacity-50">
                               <CheckCircle2 className="w-4 h-4" /> Expert Review
                           </div>
                           <div className="flex items-center gap-4 text-xs font-bold uppercase opacity-50">
                               <CheckCircle2 className="w-4 h-4" /> 24h Response Time
                           </div>
                       </div>
                  </div>

                  <div className="p-8 bg-black dark:bg-white text-white dark:text-black">
                      <Cpu className="w-8 h-8 mb-4" />
                      <div className="font-black uppercase text-2xl leading-none mb-2">Need Help?</div>
                      <p className="font-mono text-xs opacity-70 mb-6 uppercase">
                          Our support team is available for real-time consultation.
                      </p>
                      <Button variant="outline" className="w-full border-white/30 dark:border-black/30 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white rounded-none uppercase font-bold tracking-widest text-xs">
                          Contact Support
                      </Button>
                  </div>
              </div>

              {/* RIGHT COLUMN - FORM */}
              <div className="lg:col-span-8">
                  <form onSubmit={handleSubmit} className="space-y-16">
                      
                      {/* SECTION 1: TYPE */}
                      <section>
                          <div className="flex items-end gap-4 mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                              <span className="text-4xl font-black text-black/10 dark:text-white/10">01</span>
                              <h2 className="text-xl font-black uppercase tracking-widest pb-1">Project Classification</h2>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {projectTypes.map((type) => (
                                  <label key={type.id} className="relative group cursor-pointer block">
                                      <input 
                                        type="radio" 
                                        name="projectType" 
                                        value={type.id}
                                        checked={formData.projectType === type.id}
                                        onChange={(e) => handleInputChange('projectType', e.target.value)}
                                        className="peer sr-only"
                                      />
                                      <div className="border border-black/10 dark:border-white/10 p-6 flex items-center justify-between peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all duration-300 group-hover:border-black dark:group-hover:border-white">
                                          <span className="font-mono text-sm font-bold uppercase tracking-wider">{type.label}</span>
                                          <MousePointer2 className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all peer-checked:opacity-100 peer-checked:translate-x-0" />
                                      </div>
                                  </label>
                              ))}
                          </div>
                      </section>

                      {/* SECTION 2: DETAILS */}
                      <section>
                          <div className="flex items-end gap-4 mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                              <span className="text-4xl font-black text-black/10 dark:text-white/10">02</span>
                              <h2 className="text-xl font-black uppercase tracking-widest pb-1">Technical Specs</h2>
                          </div>

                          <div className="space-y-8">
                              <div className="group">
                                  <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Project Scope & Requirements</label>
                                  <Textarea 
                                      value={formData.projectDetails}
                                      onChange={(e) => handleInputChange('projectDetails', e.target.value)}
                                      className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 min-h-[150px] focus:border-blue-600 focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                                      placeholder="// START WRITING SPECS..."
                                  />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="group">
                                      <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Est. Budget</label>
                                      <Input 
                                          value={formData.budget}
                                          onChange={(e) => handleInputChange('budget', e.target.value)}
                                          className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 focus:border-blue-600 focus:ring-0 font-bold uppercase"
                                          placeholder="TRY / USD / EUR"
                                      />
                                  </div>
                                  <div className="group">
                                      <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Target Delivery</label>
                                      <Input 
                                          type="date"
                                          value={formData.deadline}
                                          onChange={(e) => handleInputChange('deadline', e.target.value)}
                                          className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 focus:border-blue-600 focus:ring-0 font-bold uppercase"
                                      />
                                  </div>
                              </div>
                          </div>
                      </section>

                      {/* SECTION 3: CONTACT */}
                      <section>
                          <div className="flex items-end gap-4 mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                              <span className="text-4xl font-black text-black/10 dark:text-white/10">03</span>
                              <h2 className="text-xl font-black uppercase tracking-widest pb-1">Client Identification</h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="group">
                                  <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Full Name</label>
                                  <Input 
                                      value={formData.fullName}
                                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                                      className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 focus:border-blue-600 focus:ring-0 font-bold uppercase"
                                      placeholder="JOHN DOE"
                                  />
                               </div>
                               <div className="group">
                                  <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Email Address</label>
                                  <Input 
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) => handleInputChange('email', e.target.value)}
                                      className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 focus:border-blue-600 focus:ring-0 font-bold uppercase"
                                      placeholder="JOHN@EXAMPLE.COM"
                                  />
                               </div>
                               <div className="group">
                                  <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Phone Number</label>
                                  <Input 
                                      type="tel"
                                      value={formData.phone}
                                      onChange={(e) => handleInputChange('phone', e.target.value)}
                                      className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 focus:border-blue-600 focus:ring-0 font-bold uppercase"
                                      placeholder="+90 XXX XXX XX XX"
                                  />
                               </div>
                               <div className="group">
                                  <label className="text-xs font-black uppercase tracking-widest mb-2 block group-focus-within:text-blue-600 transition-colors">Project Location</label>
                                  <Input 
                                      value={formData.location}
                                      onChange={(e) => handleInputChange('location', e.target.value)}
                                      className="rounded-none border-t-0 border-x-0 border-b-2 border-black/10 dark:border-white/10 bg-transparent px-0 focus:border-blue-600 focus:ring-0 font-bold uppercase"
                                      placeholder="ISTANBUL, TR"
                                  />
                               </div>
                          </div>
                      </section>

                      {/* SUBMIT */}
                      <div className="pt-8">
                          <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="w-full h-20 rounded-none bg-blue-600 hover:bg-black dark:hover:bg-white dark:hover:text-black text-white text-xl font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between px-8"
                          >
                              {isSubmitting ? (
                                  <span className="flex items-center gap-4">
                                      <Loader2 className="w-6 h-6 animate-spin" /> Processing Protocol...
                                  </span>
                              ) : (
                                  <>
                                      <span>Initiate Request</span>
                                      <ArrowRight className="w-6 h-6" />
                                  </>
                              )}
                          </Button>
                          <p className="font-mono text-[10px] text-center mt-4 text-slate-400 uppercase">
                              By clicking initiate, you agree to our terms of architectural service protocols.
                          </p>
                      </div>

                  </form>
              </div>

          </div>
      </div>

      <AlertModal 
          isOpen={showSuccess}
          onClose={() => {
              setShowSuccess(false);
              router.push('/dashboard');
          }}
          title="PROTOCOL INITIATED"
          message="Your proposal request has been successfully transmitted to our network. You will receive a technical response within 24 hours."
          type="success"
          buttonText="RETURN TO DASHBOARD"
      />

    </div>
  );
}
