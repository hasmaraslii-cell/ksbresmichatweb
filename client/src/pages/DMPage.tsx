import { Link, Route, Switch } from "wouter";
import { DMInbox } from "@/components/DMInbox";
import { DMChat } from "@/components/DMChat";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DMPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    (window as any).setSelectedUserForDM = setSelectedUser;
    return () => { delete (window as any).setSelectedUserForDM; };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col font-mono text-zinc-300">
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-500" />
              KRİPTO_İLETİŞİM_HATTI
            </h1>
            <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Durum: Güvenli / Şifreleme: Aktif</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 bg-zinc-950/50 flex-shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}>
          <DMInbox 
            onClose={() => {}} 
            onSelectChat={setSelectedUser}
          />
        </div>
        
        <div className={`flex-1 relative bg-black/40 ${!selectedUser ? 'hidden md:flex' : 'flex'} items-center justify-center`}>
          {selectedUser ? (
            <DMChat 
              otherUser={selectedUser} 
              onClose={() => setSelectedUser(null)} 
            />
          ) : (
            <div className="text-center space-y-4 opacity-20">
              <MessageSquare className="h-16 w-16 mx-auto" />
              <p className="text-[10px] uppercase tracking-[0.3em]">Mesajlaşmak için bir personel seçin</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
