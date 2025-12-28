"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Fingerprint,
  Cpu,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { loginSchema, LoginFormData } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();

  const form = useForm({
    schema: loginSchema,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await login(data.email, data.password);

      if (response.success) {
        router.push("/dashboard");
      } else {
        setError(response.error || "Access Denied: Invalid Credentials");
        // Shake animation logic could go here
      }
    } catch (error) {
      setError("System Error: Connection Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-mono text-xs tracking-[0.2em]">INITIALIZING SECURITY PROTOCOLS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-[#050505] text-black dark:text-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - VISUAL (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#020202] relative overflow-hidden flex-col justify-between p-12 text-white border-r border-white/10">
        
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none">
            <svg className="w-full h-full" width="100%" height="100%">
            <defs>
                <pattern id="grid-pattern-login" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-login)" />
            </svg>
        </div>

        {/* Abstract 3D Form Placeholder - CSS Only */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/20 rounded-full animate-[spin_60s_linear_infinite] opacity-20">
            <div className="absolute inset-4 border border-white/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-8 border border-white/20 rounded-full animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-white flex items-center justify-center bg-white text-black">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">Mimariproje</span>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 max-w-md">
            <h1 className="text-5xl font-black uppercase leading-[0.9] mb-6">
                Build The <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Impossible.</span>
            </h1>
            <p className="font-mono text-sm opacity-60 leading-relaxed border-l-2 border-white/30 pl-4 py-1">
                SECURE ACCESS TERMINAL v2.0 <br/>
                AUTHORIZED PERSONNEL ONLY
            </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative bg-zinc-50 dark:bg-[#050505]">
          
          {/* Mobile Branding (Visible only on small screens) */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
             <Building2 className="h-6 w-6" />
             <span className="font-black uppercase tracking-tighter">Mimariproje</span>
          </div>

          <div className="w-full max-w-md mx-auto">
            {/* Form Header */}
            <div className="mb-12">
                <div className="flex items-center gap-2 text-xs font-mono mb-2 text-gray-500 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Identity Verification</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">
                    Authenticate
                </h2>
                <div className="h-1 w-24 bg-black dark:bg-white mb-6" />
                <p className="text-gray-500 font-mono text-sm">
                    Enter your credentials to access the architectural mainframe.
                </p>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-600 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-red-700 dark:text-red-400 text-sm uppercase mb-1">Access Denied</h4>
                    <p className="text-red-600 dark:text-red-300 text-xs font-mono">{error}</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">User Identifier</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Terminal className="absolute left-0 top-3 h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                          <Input
                            placeholder="username@domain.com"
                            className="pl-8 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-gray-800 rounded-none focus:border-black dark:focus:border-white focus:ring-0 px-0 py-6 font-mono text-sm bg-transparent transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <div className="flex items-baseline justify-between">
                         <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">Security Key</FormLabel>
                         <Link
                            href="/auth/sifremi-unuttum"
                            className="text-[10px] font-mono uppercase text-gray-400 hover:text-black dark:hover:text-white underline decoration-dotted underline-offset-4"
                          >
                            Lost Key?
                          </Link>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Fingerprint className="absolute left-0 top-3 h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            className="pl-8 pr-10 border-x-0 border-t-0 border-b-2 border-gray-200 dark:border-gray-800 rounded-none focus:border-black dark:focus:border-white focus:ring-0 px-0 py-6 font-mono text-sm bg-transparent transition-all"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-0 top-3 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 uppercase font-black tracking-widest text-sm rounded-none transition-all group relative overflow-hidden"
                  disabled={isSubmitting}
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12" />
                  <div className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Authenticate Identity</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                  </div>
                </Button>

                {/* Remember Me */}
                <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 border-2 border-gray-300 rounded-none text-black focus:ring-0 cursor-pointer"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-mono uppercase text-gray-500 cursor-pointer select-none">
                          Remember Device
                        </FormLabel>
                      </FormItem>
                    )}
                />

              </form>
            </Form>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
              <p className="text-xs font-mono text-gray-500 mb-4">
                NO ACCOUNT DETECTED?
              </p>
              <Link href="/auth/kayit">
                 <Button variant="outline" className="w-full h-12 rounded-none border-2 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white hover:bg-transparent font-bold uppercase tracking-wider text-xs">
                    Initialize New Profile
                 </Button>
              </Link>
            </div>
            
            {/* Build Version */}
            <div className="absolute bottom-4 right-4 lg:right-12 text-[10px] font-mono text-gray-300 dark:text-gray-700">
                SYS.VER.2.4.0
            </div>

          </div>
      </div>
    </div>
  );
}
