"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Terminal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email protocol detected"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      const res = await authApi.requestPasswordReset(values.email);
      if (res.success) {
        setIsSent(true);
        toast.success("Recovery signal transmitted.");
      } else {
        toast.error(res.error || "Transmission failed.");
      }
    } catch (error) {
      toast.error("Network error. System offline?");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] text-white font-sans selection:bg-blue-900 selection:text-white overflow-hidden">
      
      {/* LEFT PANEL - FORM */}
      <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-24 z-10">
        
        {/* LOGO */}
        <div className="absolute top-8 left-8 sm:left-12 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black italic text-lg rounded-sm group-hover:bg-blue-600 transition-colors">
                    MP
                </div>
                <span className="font-mono text-xs tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity">SYS.RECOVERY</span>
            </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
            {/* HEADLINE */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-bold uppercase tracking-widest mb-4">
                    <ShieldAlert className="w-4 h-4" />
                    Security Event
                </div>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                    Access<br/>Recovery_
                </h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-wide leading-relaxed pt-2">
                   Initiate protocol to reset secure credentials. A recovery signal will be transmitted to your registered comms link.
                </p>
            </div>

            {isSent ? (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm text-center space-y-4">
                    <div className="w-12 h-12 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mx-auto">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-1">Signal Transmitted</h3>
                        <p className="text-zinc-500 text-sm font-mono">Check your inbox for the recovery key.</p>
                    </div>
                     <Link href="/auth/giris">
                        <Button variant="outline" className="mt-4 w-full border-zinc-700 hover:bg-zinc-800 text-xs font-mono uppercase">
                            Return to Login
                        </Button>
                    </Link>
                </div>
            ) : (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Email Address</FormLabel>
                        <FormControl>
                            <div className="relative group">
                                <Input 
                                    className="bg-transparent border-t-0 border-x-0 border-b border-zinc-800 rounded-none focus-visible:ring-0 focus-visible:border-blue-600 px-0 py-6 text-lg font-mono text-white placeholder:text-zinc-800 transition-all font-bold group-hover:border-zinc-700"
                                    placeholder="USER@DOMAIN.COM" 
                                    {...field} 
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Terminal className="w-4 h-4 text-zinc-600" />
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage className="font-mono text-[10px] text-red-500 pt-1" />
                        </FormItem>
                    )}
                    />

                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-14 bg-white text-black hover:bg-blue-600 hover:text-white rounded-sm text-sm font-black uppercase tracking-widest transition-all mt-4"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="animate-pulse">Transmitting...</span>
                            </div>
                        ) : (
                            "Send Recovery Signal"
                        )}
                    </Button>
                </form>
                </Form>
            )}

            <div className="pt-8 flex justify-center">
                 <Link href="/auth/giris" className="text-zinc-600 hover:text-white text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Abort / Return to Login
                </Link>
            </div>

        </div>
      </div>

      {/* RIGHT PANEL - VISUAL */}
      <div className="hidden lg:block relative bg-zinc-900 border-l border-white/5 overflow-hidden">
        {/* Abstract 3D Form / Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{
                 backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                 backgroundSize: '40px 40px'
             }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[400px] h-[400px] border border-white/10 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]">
                 <div className="w-[300px] h-[300px] border border-blue-600/20 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite_reverse]">
                     <div className="w-[200px] h-[200px] border border-white/10 rounded-full animate-pulse" />
                 </div>
            </div>
        </div>

        <div className="absolute bottom-12 right-12 text-right">
             <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1"> System Status</div>
             <div className="text-2xl font-black text-zinc-800 uppercase tracking-tighter">Secure Mode Active</div>
        </div>

      </div>

    </div>
  );
}
