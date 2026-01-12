import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useChat } from "@/hooks/use-chat";
import { useLocation, Link } from "wouter";
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
          </TabsList>

          <TabsContent value="personnel">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <BentoCard className="p-0 border-white/10">
                <Table>
                  <TableHeader className="bg-white/5 hover:bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Agent</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Rank</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Role</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={u} className="h-8 w-8" />
                            <div>
                              <div className="text-zinc-300 text-xs">{u.username}</div>
                              <div className="text-zinc-600 text-[10px]">{u.displayName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RankBadge rank={u.rank} />
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs uppercase ${u.role === 'admin' ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.isDeleted ? (
                            <span className="text-red-500 text-[10px] bg-red-950/20 px-2 py-1 border border-red-900/20">BANNED</span>
                          ) : (
                            <span className="text-green-500 text-[10px] bg-green-950/20 px-2 py-1 border border-green-900/20">ACTIVE</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserDelete.mutate(u.id)}
                            disabled={u.id === user.id}
                            className={`
                              h-8 px-3 text-xs tracking-wider uppercase border 
                              ${u.isDeleted 
                                ? 'border-green-900/30 text-green-500 hover:bg-green-950/30' 
                                : 'border-red-900/30 text-red-500 hover:bg-red-950/30'
                              }
                            `}
                          >
                            {u.isDeleted ? <><CheckCircle className="mr-2 h-3 w-3" /> RESTORE</> : <><Ban className="mr-2 h-3 w-3" /> BAN</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </BentoCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="intelligence">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <BentoCard className="p-0 border-white/10">
                <Table>
                  <TableHeader className="bg-white/5 hover:bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest w-[180px]">Timestamp</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest w-[150px]">Sender</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">Content</TableHead>
                      <TableHead className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest text-right">Recover</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedMessages.map((m) => (
                      <TableRow key={m.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="text-zinc-500 text-xs font-mono">
                          {format(new Date(m.createdAt!), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserAvatar user={m.user} className="h-6 w-6" />
                            <span className="text-xs text-zinc-400">{m.user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-400/70 italic text-sm font-mono border-l-2 border-red-900/20 pl-4 py-4">
                          {m.content}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => restoreMessage.mutate(m.id)}
                            className="text-cyan-500 hover:text-cyan-300 hover:bg-cyan-950/20"
                          >
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {deletedMessages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-zinc-600 text-xs uppercase tracking-widest">
                          No redacted intelligence found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </BentoCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
