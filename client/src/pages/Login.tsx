import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

// Using local asset for logo as requested
import logoImg from "/images/logo.png";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register({ username, password });
      } else {
        await login({ username, password });
      }
      setLocation("/");
    } catch (err) {
      // Error handled by hook toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-[#0a0a0b] to-[#001a1d] opacity-80" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            {/* HTML Comment describing image for fallback */}
            {/* Ak Sangur Logo - Hawk emblem with geometric wings */}
            <div className="relative">
              <img 
                src={logoImg} 
                alt="Ak Sangur Logo" 
                className="h-32 w-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.1)] mask-image-gradient"
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0b] to-transparent pointer-events-none" />
            </div>
          </motion.div>
          
          <h1 className="text-2xl font-mono text-zinc-500 tracking-[0.3em] uppercase mb-2">
            {isRegister ? "KAYIT OL" : "GİRİŞ YAP"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-zinc-600 ml-1">KULLANICI ADI</Label>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-900/30 border-zinc-800 text-zinc-300 font-mono tracking-wider focus:border-cyan-900/50 focus:ring-1 focus:ring-cyan-900/20 h-12 transition-all duration-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-zinc-600 ml-1">PAROLA</Label>
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900/30 border-zinc-800 text-zinc-300 font-mono tracking-wider focus:border-cyan-900/50 focus:ring-1 focus:ring-cyan-900/20 h-12 transition-all duration-300"
            />
          </div>

          <div className="space-y-4">
            <Button 
              type="submit" 
              disabled={isLoggingIn || isRegistering}
              className="w-full h-12 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 font-mono uppercase tracking-widest text-xs transition-all duration-300 hover:border-cyan-500/30 hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]"
            >
              {isLoggingIn || isRegistering ? "DOĞRULANIYOR..." : (isRegister ? "KAYDI TAMAMLA" : "OTURUMU BAŞLAT")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-zinc-500 hover:text-zinc-300 font-mono text-[10px] uppercase tracking-widest"
            >
              {isRegister ? "ZATEN HESABIN VAR MI? GİRİŞ YAP" : "HESABIN YOK MU? KAYIT OL"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
