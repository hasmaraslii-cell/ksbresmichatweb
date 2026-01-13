import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { ChatDrawer } from "@/components/ChatDrawer";
import { DMChat } from "@/components/DMChat";
import { motion } from "framer-motion";
import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { Terminal, ShieldAlert, Activity, Users, Star } from "lucide-react";
import logoImg from "/images/logo.png";
import { RankBadge } from "@/components/RankBadge";
import { useEffect, useState } from "react";
import type { User } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserForDM, setSelectedUserForDM] = useState<User | null>(null);

  useEffect(() => {
    (window as any).setSelectedUserForDM = setSelectedUserForDM;
    return () => { delete (window as any).setSelectedUserForDM; };
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-mono animate-pulse">SİSTEM_KAYNAKLARI_YÜKLENİYOR...</div>;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white relative overflow-hidden font-sans selection:bg-cyan-900 selection:text-white" data-dashboard>
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-start">
        <div className="flex items-center gap-4">
           {/* Profile Drawer Trigger is inside the component */}
           <ProfileDrawer />
           <div className="hidden sm:block">
             <div className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-widest">OPERATÖR</div>
             <div className="text-xs md:text-sm font-bold tracking-wider text-zinc-300">{user.username}</div>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <ChatDrawer />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center relative z-10 pt-20 pb-20">
        
        {/* Centerpiece */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 relative w-full max-w-4xl"
        >
          {/* Logo with bottom fade mask */}
          <div className="relative mb-8 mx-auto w-64 md:w-96">
            <img 
              src={logoImg} 
              alt="Ak Sangur" 
              className="w-full h-auto opacity-90 drop-shadow-2xl"
            />
            {/* Gradient Mask to fade bottom of logo into background */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent h-full w-full" />
          </div>

          <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-[0.2em] text-white/90 mb-4 text-shadow-sm">
            AK SANGUR
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="h-[1px] w-12 bg-zinc-800" />
            <p className="font-mono text-cyan-900 text-sm tracking-[0.4em] uppercase animate-pulse-slow">
              Bir varmış, Bir yokmuş
            </p>
            <div className="h-[1px] w-12 bg-zinc-800" />
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
            <BentoCard className="col-span-1 flex items-center justify-between p-6 hover:bg-white/5 cursor-pointer border border-white/5 bg-black/40 backdrop-blur-sm group relative overflow-hidden transition-all duration-500">
              <Link href="/core" className="absolute inset-0 z-10" />
              <div className="flex items-center gap-5">
                <div className="p-3 bg-yellow-950/20 rounded-md border border-yellow-900/30 group-hover:border-yellow-500/50 transition-colors">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-mono text-white tracking-wider group-hover:text-yellow-100 transition-colors">CORE ÜYELİK</h3>
                  <p className="text-[10px] text-yellow-500/70 font-mono mt-1 uppercase tracking-[0.2em]">Ayrıcalıklar Dünyası</p>
                </div>
              </div>
            </BentoCard>

            {user.role === 'admin' && (
              <BentoCard className="col-span-1 md:col-span-2 flex items-center justify-between p-6 hover:bg-white/5 cursor-pointer border border-white/5 bg-black/40 backdrop-blur-sm group relative overflow-hidden transition-all duration-500">
                 <Link href="/admin" className="absolute inset-0 z-10" />
                 
                 {/* Admin indicator line */}
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] group-hover:bg-red-500 transition-colors" />
                 
                 <div className="flex items-center gap-5">
                   <div className="p-3 bg-red-950/20 rounded-md border border-red-900/30 group-hover:border-red-500/50 transition-colors">
                     <ShieldAlert className="h-6 w-6 text-red-500" />
                   </div>
                   <div className="text-left">
                     <h3 className="text-lg font-mono text-white tracking-wider group-hover:text-red-100 transition-colors">KOMUTA MERKEZİ</h3>
                     <p className="text-[10px] text-red-500/70 font-mono mt-1 uppercase tracking-[0.2em]">Kısıtlı Alan // Admin Erişimi</p>
                   </div>
                 </div>
                 
                 <div className="hidden sm:flex flex-col items-end gap-1">
                   <div className="text-red-500/40 text-[9px] font-mono tracking-[0.3em] animate-pulse">SİSTEM_AKTİF</div>
                   <div className="h-1 w-12 bg-red-900/30 rounded-full overflow-hidden">
                     <div className="h-full bg-red-600 w-1/2 animate-[shimmer_2s_infinite]" />
                   </div>
                 </div>
              </BentoCard>
            )}
          </div>

        </motion.div>
      </main>

      {selectedUserForDM && (
        <DMChat otherUser={selectedUserForDM} onClose={() => setSelectedUserForDM(null)} />
      )}

      {/* Footer Navigation Button - instead of hamburger */}
      {user?.role !== 'admin' && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <Button 
            className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/50 hover:bg-black px-8 py-6 font-mono tracking-[0.2em] text-xs transition-all duration-300 shadow-2xl"
            onClick={() => window.location.reload()}
          >
            KONTROL PANELİ
          </Button>
        </div>
      )}
    </div>
  );
}
