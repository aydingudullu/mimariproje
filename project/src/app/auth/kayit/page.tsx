"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  Briefcase,
  MapPin,
  CheckCircle2,
  Loader2,
  Terminal,
  Cpu
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { registerSchema, RegisterFormData, CITIES } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState<"individual" | "company">("individual");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    schema: registerSchema,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      user_type: "individual",
      first_name: "",
      last_name: "",
      company_name: "",
      profession: "",
      phone: "",
      location: "",
      terms_accepted: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleUserTypeChange = (type: "individual" | "company") => {
    setSelectedUserType(type);
    form.setValue("user_type", type);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await register({
        email: data.email,
        password: data.password,
        user_type: data.user_type,
        first_name: data.first_name,
        last_name: data.last_name,
        company_name: data.company_name,
        profession: data.profession,
        phone: data.phone,
        location: data.location,
      });

      if (response.success) {
        router.push("/dashboard");
      } else {
        setError(response.error || "Registration Failed: Network Error");
      }
    } catch (error) {
      setError("Critical Error: Connection Refused");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-mono text-xs tracking-[0.2em]">ESTABLISHING SECURE CONNECTION...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-white dark:bg-[#080808] text-black dark:text-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 lg:px-24 xl:px-32 py-12 relative bg-zinc-50 dark:bg-[#080808] overflow-y-auto max-h-screen custom-scrollbar">
          
          {/* Branding Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
             <Building2 className="h-6 w-6" />
             <span className="font-black uppercase tracking-tighter">Mimariproje</span>
          </div>

          <div className="w-full max-w-lg mx-auto pb-12">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-xs font-mono mb-2 text-gray-500 uppercase tracking-widest">
                    <Terminal className="w-4 h-4" />
                    <span>New Profile Induction</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4">
                    Join The<br/>Network.
                </h2>
                <div className="h-1 w-24 bg-black dark:bg-white mb-6" />
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                    type="button"
                    onClick={() => handleUserTypeChange("individual")}
                    className={`
                        relative group p-4 border-2 text-left transition-all duration-300
                        ${selectedUserType === "individual" 
                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                            : 'border-gray-200 dark:border-white/10 hover:border-black/50 dark:hover:border-white/50 text-gray-500'}
                    `}
                >
                    <User className="w-6 h-6 mb-2" />
                    <div className="font-black uppercase text-sm tracking-wide">Freelance Architect</div>
                    {selectedUserType === "individual" && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                </button>

                <button
                    type="button"
                    onClick={() => handleUserTypeChange("company")}
                    className={`
                        relative group p-4 border-2 text-left transition-all duration-300
                        ${selectedUserType === "company" 
                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                            : 'border-gray-200 dark:border-white/10 hover:border-black/50 dark:hover:border-white/50 text-gray-500'}
                    `}
                >
                    <Building2 className="w-6 h-6 mb-2" />
                    <div className="font-black uppercase text-sm tracking-wide">Architecture Firm</div>
                    {selectedUserType === "company" && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                </button>
            </div>
            
            {/* Error */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase mb-1">Registration Error</h4>
                    <p className="text-red-600 dark:text-red-300 text-xs font-mono">{error}</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">First Name</FormLabel>
                        <FormControl>
                            <Input placeholder="JOHN" className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name</FormLabel>
                        <FormControl>
                            <Input placeholder="DOE" className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                    />
                </div>

                {/* Conditional Company Name */}
                {selectedUserType === "company" && (
                     <FormField
                     control={form.control}
                     name="company_name"
                     render={({ field }) => (
                         <FormItem className="space-y-1 animate-in fade-in slide-in-from-top-2">
                         <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registered Firm Name</FormLabel>
                         <FormControl>
                             <div className="relative">
                                <Briefcase className="absolute right-0 top-3 w-4 h-4 text-gray-300" />
                                <Input placeholder="ARCH STUDIO INC." className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                             </div>
                         </FormControl>
                         <FormMessage className="text-[10px]" />
                         </FormItem>
                     )}
                     />
                )}

                {/* Contact Info */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@domain.com" className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</FormLabel>
                        <FormControl>
                            <Input placeholder="+90 ..." className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:ring-0 px-0 font-mono text-sm">
                                    <SelectValue placeholder="SELECT CITY" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px] font-mono">
                                    {CITIES.map((city) => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                    />
                </div>

                {/* Password Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirm Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" className="h-12 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-white/10 rounded-none bg-transparent focus:border-black dark:focus:border-white px-0 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                    />
                </div>

                {/* Terms */}
                <FormField
                    control={form.control}
                    name="terms_accepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 border-2 border-gray-300 rounded-none text-black focus:ring-0 cursor-pointer"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs text-gray-500 font-mono uppercase">
                            I accept the <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Protocol</Link>.
                          </FormLabel>
                          <FormMessage className="text-[10px]" />
                        </div>
                      </FormItem>
                    )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-14 mt-6 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 uppercase font-black tracking-widest text-sm rounded-none transition-all"
                  disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        PROCESSING...
                        </>
                    ) : (
                        <>Establish Connection <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                </Button>

              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
              <p className="text-xs font-mono text-gray-500">
                ALREADY IN THE SYSTEM?{" "}
                <Link href="/auth/giris" className="text-black dark:text-white font-bold underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors">
                   LOGIN NOW
                </Link>
              </p>
            </div>

          </div>
      </div>

      {/* RIGHT PANEL - VISUAL (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#020202] relative overflow-hidden flex-col justify-between p-12 text-white border-l border-white/10">
          
           {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none">
                <svg className="w-full h-full" width="100%" height="100%">
                <defs>
                    <pattern id="grid-pattern-reg" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern-reg)" />
                </svg>
            </div>

            {/* Abstract Animation */}
            <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center opacity-30">
                 <div className="relative w-[600px] h-[600px] border border-white/10 rounded-full animate-[spin_120s_linear_infinite]">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/10 rotate-45" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white/10 -rotate-12" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] border border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                 </div>
            </div>

            <div className="relative z-10 flex justify-end">
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-2xl font-black italic uppercase tracking-tighter">
                        Mimari<span className="text-blue-500">proje</span>
                        </span>
                        <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-white/50">Registry.MP</span>
                    </div>
                    <div className="w-10 h-10 border-2 border-white flex items-center justify-center bg-white text-black">
                        <Building2 className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-lg ml-auto text-right">
                <Cpu className="w-12 h-12 text-white mb-6 ml-auto opacity-50" />
                <h1 className="text-5xl font-black uppercase leading-[0.9] mb-6">
                    Design <br/> 
                    The Future <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Today.</span>
                </h1>
                <p className="font-mono text-sm opacity-60 leading-relaxed border-r-2 border-white/30 pr-4 py-1">
                    Join the elite network of architectural<br/> innovators and potential builders.
                </p>
            </div>

      </div>

    </div>
  );
}
