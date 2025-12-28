"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsPanel } from "@/components/notifications-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  User,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Briefcase,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

// ... inside Header component
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Hide header on auth pages
  const isAuthPage = pathname?.includes('/auth/');

  if (isAuthPage) return null;

  const navLinks = [
    { href: "/projeler", label: "Projeler" },
    { href: "/uzmanlar", label: "Uzmanlar" },
    { href: "/firmalar", label: "Firmalar" },
    { href: "/is-ilanlari", label: "İş İlanları" },
  ];

  return (
    <header 
      className={`fixed top-0 z-[100] w-full transition-all duration-500 ${
        isScrolled 
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between gap-8">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="group relative flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-2 bg-blue-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition duration-500" />
                <Building2 className="relative h-10 w-10 text-black dark:text-white transition-transform group-hover:-rotate-12 duration-500" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black italic uppercase tracking-tighter text-black dark:text-white">
                  Mimari<span className="text-blue-600">proje</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Registry.MP</span>
              </div>
            </Link>
          </div>

          {/* Search Interface - Premium Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl group">
            <div className="relative w-full overflow-hidden rounded-full border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-1 transition-all duration-500 focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600/50">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="PROJE, MİMAR VEYA STİL KEŞFET..."
                className="pl-14 h-12 w-full border-none bg-transparent focus-visible:ring-0 text-[10px] font-black uppercase tracking-widest"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 px-2 py-1 rounded bg-white dark:bg-black border border-slate-100 dark:border-white/5">ESC</span>
              </div>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-600 transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="h-6 w-[1px] bg-slate-100 dark:bg-white/10 hidden lg:block" />

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-slate-100 dark:hover:bg-white/5"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  <NotificationsPanel />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-blue-600/50 transition-all">
                        <Avatar className="h-full w-full">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback className="bg-blue-600 text-white font-black text-xs">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 mt-2 p-3 rounded-[2rem] bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 shadow-2xl" align="end">
                      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] mb-2">
                        <p className="font-black italic uppercase text-sm tracking-tight">{user.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">ID: MP-{user.id}</p>
                      </div>
                      <DropdownMenuItem className="rounded-xl p-3 font-bold text-[10px] uppercase tracking-widest cursor-pointer" asChild>
                        <Link href="/profil/me"><User className="mr-3 h-4 w-4" /> Profilim</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl p-3 font-bold text-[10px] uppercase tracking-widest cursor-pointer" asChild>
                        <Link href="/mesajlar"><MessageCircle className="mr-3 h-4 w-4" /> Mesajlar</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl p-3 font-bold text-[10px] uppercase tracking-widest cursor-pointer" asChild>
                        <Link href="/ayarlar"><Settings className="mr-3 h-4 w-4" /> Ayarlar</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-xl p-3 font-bold text-[10px] uppercase tracking-widest cursor-pointer text-red-500 focus:text-red-500" onClick={() => logout()}>
                        <LogOut className="mr-3 h-4 w-4" /> Çıkış Yap
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest" asChild>
                    <Link href="/auth/giris">Giriş</Link>
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-black dark:hover:bg-white dark:hover:text-black rounded-full px-6 font-black text-[10px] uppercase tracking-widest transition-all" asChild>
                    <Link href="/auth/kayit">Üye Ol</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-full"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl z-[90] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] sm:w-[50%] bg-white dark:bg-[#050505] border-l border-slate-100 dark:border-white/5 z-[100] lg:hidden flex flex-col p-10"
            >
              <div className="flex justify-between items-center mb-20">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">NAVIGATION</span>
                 <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleMenu}><X className="w-6 h-6"/></Button>
              </div>

              <div className="flex flex-col gap-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={link.href} 
                      onClick={toggleMenu}
                      className="text-5xl font-black italic uppercase tracking-tighter hover:text-blue-600 transition-colors flex items-center justify-between group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto space-y-6">
                 {!isAuthenticated && (
                   <div className="flex flex-col gap-4">
                      <Button className="w-full h-16 bg-blue-600 rounded-full font-black uppercase tracking-widest" asChild>
                        <Link href="/auth/kayit">ŞİMDİ ÜYE OL</Link>
                      </Button>
                      <Button variant="outline" className="w-full h-16 rounded-full font-black uppercase tracking-widest border-2" asChild>
                        <Link href="/auth/giris">GİRİŞ YAP</Link>
                      </Button>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.5em] text-slate-400">
                    <span>EST. 2025</span>
                    <span>MP_CORE_V2</span>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
