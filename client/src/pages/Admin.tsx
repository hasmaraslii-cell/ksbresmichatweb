import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useChat } from "@/hooks/use-chat";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { RankBadge } from "@/components/RankBadge";
import { ArrowLeft, Ban, CheckCircle, Trash2, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { users, toggleUserDelete } = useUsers();
  const { messages, restoreMessage } = useChat();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: pendingFanarts = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/fanarts"],
  });

  const giftCoreMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/gift-core/${userId}`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Core Hediye Edildi", description: "Kullanıcı 30 günlük Core yetkisi kazandı." });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  });

  const manageFanartMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/fanarts/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Başvuru Güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fanarts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  });

  if (isLoading) return null;

  if (!user || user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  const deletedMessages = messages?.filter(m => m.isDeleted) || [];

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
            <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white uppercase">KOMUTA_MERKEZİ</h1>
            <p className="text-[10px] text-red-500 uppercase tracking-widest">Yetkili Personel: {user.username}</p>
          </div>
        </div>

        <Tabs defaultValue="personnel" className="w-full">
          <TabsList className="bg-black border border-white/10 p-1 mb-6 rounded-none w-full justify-start h-auto flex-wrap">
            <TabsTrigger 
              value="personnel"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-500 rounded-none px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs tracking-widest uppercase flex-1 md:flex-none"
            >
              Personel Veritabanı
            </TabsTrigger>
            <TabsTrigger 
              value="intelligence"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-500 rounded-none px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs tracking-widest uppercase flex-1 md:flex-none"
            >
              Kurtarılan Veriler ({deletedMessages.length})
            </TabsTrigger>
            <TabsTrigger 
              value="fanarts"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-500 rounded-none px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs tracking-widest uppercase flex-1 md:flex-none"
            >
              Fanart Başvuruları ({pendingFanarts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personnel">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <BentoCard className="p-0 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/5 hover:bg-white/5">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest min-w-[150px]">Agent</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest min-w-[120px]">Rank</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest hidden sm:table-cell">Role</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Core</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((u) => (
                        <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={u as any} className="h-8 w-8" />
                              <div className="min-w-0">
                                <div className="text-zinc-300 text-xs truncate max-w-[80px] sm:max-w-none">{u.username}</div>
                                <div className="text-zinc-600 text-[9px] truncate max-w-[80px] sm:max-w-none">{u.displayName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <select 
                              defaultValue={u.rank || "Yolcu"} 
                              onChange={async (e) => {
                                try {
                                  await apiRequest("PATCH", `/api/admin/update-rank/${u.id}`, { rank: e.target.value });
                                  toast({ title: "Rütbe Güncellendi" });
                                  queryClient.invalidateQueries({ queryKey: ["/api/users"] });
                                } catch (err) {
                                  toast({ title: "Hata", description: "Rütbe güncellenemedi", variant: "destructive" });
                                }
                              }}
                              className="bg-black border border-white/10 text-zinc-400 text-[9px] uppercase font-mono px-1 py-1 outline-none focus:border-cyan-500 w-full max-w-[100px]"
                            >
                              <option value="Kurucu" disabled={u.username !== "Raith1905" && u.username !== "YAKEFBALL"}>Kurucu</option>
                              <option value="Başlider" disabled={u.username !== "Raith1905" && u.username !== "YAKEFBALL"}>Başlider</option>
                              <option value="Konsey Üyesi">Konsey Üyesi</option>
                              <option value="General">General</option>
                              <option value="Kurmay">Kurmay</option>
                              <option value="Yönetici">Yönetici</option>
                              <option value="Kaptan">Kaptan</option>
                              <option value="Efsane">Efsane</option>
                              <option value="Üstad">Üstad</option>
                              <option value="Gözcü">Gözcü</option>
                              <option value="Şövalye">Şövalye</option>
                              <option value="Muhafız">Muhafız</option>
                              <option value="Kıdemli">Kıdemli</option>
                              <option value="Savaşçı">Savaşçı</option>
                              <option value="Yaver">Yaver</option>
                              <option value="Temsilci">Temsilci</option>
                              <option value="Kaşif">Kaşif</option>
                              <option value="Nefer">Nefer</option>
                              <option value="Gönüllü">Gönüllü</option>
                              <option value="Çırak">Çırak</option>
                              <option value="Aday">Aday</option>
                              <option value="Yolcu">Yolcu</option>
                            </select>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className={`text-[10px] uppercase ${u.role === 'admin' ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {u.isCore ? (
                              <div className="flex flex-col">
                                <span className="text-yellow-500 text-[9px] font-bold">CORE</span>
                                {u.coreExpiry && (
                                  <span className="text-[7px] text-zinc-600 hidden sm:block">
                                    {format(new Date(u.coreExpiry), "dd.MM.yy")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-[9px] h-6 px-1.5 border border-yellow-900/30 text-yellow-600 hover:bg-yellow-950/20"
                                onClick={() => giftCoreMutation.mutate(u.id)}
                              >
                                CORE
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {u.isDeleted ? (
                              <span className="text-red-500 text-[9px] bg-red-950/20 px-1.5 py-0.5 border border-red-900/20">BANNED</span>
                            ) : (
                              <span className="text-green-500 text-[9px] bg-green-950/20 px-1.5 py-0.5 border border-green-900/20">ACTIVE</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserDelete.mutate(u.id)}
                              disabled={u.id === user.id}
                              className={`
                                h-7 px-2 text-[9px] tracking-wider uppercase border 
                                ${u.isDeleted 
                                  ? 'border-green-900/30 text-green-500 hover:bg-green-950/30' 
                                  : 'border-red-900/30 text-red-500 hover:bg-red-950/30'
                                }
                              `}
                            >
                              {u.isDeleted ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </BentoCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="intelligence">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <BentoCard className="p-0 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/5 hover:bg-white/5">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest min-w-[120px]">Time</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Agent</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Data</TableHead>
                        <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest text-right">Rec</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedMessages.map((m) => (
                        <TableRow key={m.id} className="border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="text-zinc-500 text-[10px] font-mono whitespace-nowrap">
                            {format(new Date(m.createdAt!), "HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserAvatar user={m.user} className="h-5 w-5" />
                              <span className="text-[10px] text-zinc-400 truncate max-w-[60px]">{m.user.username}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-red-400/70 italic text-xs font-mono border-l border-red-900/10 pl-2 py-2 max-w-[150px] truncate">
                            {m.content}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => restoreMessage.mutate(m.id)}
                              className="h-7 w-7 text-cyan-500 hover:text-cyan-300 hover:bg-cyan-950/20"
                            >
                              <Undo2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {deletedMessages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
                            No intelligence found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </BentoCard>
            </motion.div>
          </TabsContent>
          <TabsContent value="fanarts">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingFanarts.map((f) => (
                <BentoCard key={f.id} className="overflow-hidden flex flex-col border-white/10">
                  <img src={f.imageUrl} alt="Fanart" className="w-full h-48 object-cover border-b border-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={f.user as any} className="h-6 w-6" />
                      <span className="text-sm font-bold">{f.user.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-green-950/30 text-green-500 border-green-900/30 hover:bg-green-900/40"
                        onClick={() => manageFanartMutation.mutate({ id: f.id, status: "approved" })}
                      >
                        KABUL ET
                      </Button>
                      <Button 
                        variant="destructive"
                        className="flex-1 bg-red-950/30 text-red-500 border-red-900/30 hover:bg-red-900/40"
                        onClick={() => manageFanartMutation.mutate({ id: f.id, status: "rejected" })}
                      >
                        REDDET
                      </Button>
                    </div>
                  </div>
                </BentoCard>
              ))}
              {pendingFanarts.length === 0 && (
                <div className="col-span-full h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg text-zinc-600 uppercase tracking-widest text-xs">
                  BEKLEYEN BAŞVURU YOK
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
