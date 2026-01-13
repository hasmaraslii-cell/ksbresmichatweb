import { useQuery } from "@tanstack/react-query";
import { BentoCard } from "@/components/BentoCard";
import { UserAvatar } from "@/components/UserAvatar";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FanartGallery() {
  const { data: approvedFanarts = [] } = useQuery<any[]>({
    queryKey: ["/api/fanarts/approved"],
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6 font-mono text-zinc-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-white/10 bg-black hover:bg-white/5 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase">AK_SANGUR_GALERİ</h1>
            <p className="text-[10px] text-cyan-500 uppercase tracking-widest">Onaylanmış Fanart Koleksiyonu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedFanarts.map((f) => (
            <BentoCard key={f.id} className="overflow-hidden flex flex-col border-white/10 group">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={f.imageUrl} 
                  alt="Fanart" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <ImageIcon className="h-8 w-8 text-white/50" />
                </div>
              </div>
              <div className="p-4 flex items-center gap-3 bg-black/40">
                <UserAvatar user={f.user} className="h-8 w-8" />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">{f.user.displayName || f.user.username}</div>
                  <div className="text-[8px] text-zinc-500 uppercase">KATKI SAĞLAYAN PERSONEL</div>
                </div>
              </div>
            </BentoCard>
          ))}
          {approvedFanarts.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg text-zinc-600 space-y-4">
              <ImageIcon className="h-12 w-12 opacity-20" />
              <span className="uppercase tracking-widest text-xs">GALERİ HENÜZ BOŞ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
