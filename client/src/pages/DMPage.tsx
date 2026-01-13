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
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-white/10 bg-black hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-500" />
              MESAJLAR
            </h1>
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Güvenli İletişim Hattı</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <Shield className="h-3 w-3" /> UÇTAN UCA ŞİFRELİ
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <DMInbox 
          onClose={() => {}} 
          onSelectChat={setSelectedUser}
        />
        
        {selectedUser && (
          <DMChat 
            otherUser={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </main>
    </div>
  );
}
