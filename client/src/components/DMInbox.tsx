import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Search } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import type { User, DirectMessage } from "@shared/schema";
import { format } from "date-fns";

interface DMInboxProps {
  onClose: () => void;
  onSelectChat: (user: User) => void;
}

export function DMInbox({ onSelectChat }: DMInboxProps) {
  const { user } = useAuth();
  const { users } = useUsers();
  const [search, setSearch] = useState("");

  const { data: allDms = [] } = useQuery<DirectMessage[]>({
    queryKey: ["/api/dms/all"],
    refetchInterval: 1000,
  });

  // Group DMs by conversation
  const lastMessages = allDms.reduce((acc, dm) => {
    const otherId = dm.senderId === user?.id ? dm.receiverId : dm.senderId;
    if (!acc[otherId] || new Date(dm.createdAt!) > new Date(acc[otherId].createdAt!)) {
      acc[otherId] = dm;
    }
    return acc;
  }, {} as Record<number, DirectMessage>);

  const conversationUsers = users?.filter(u => 
    u.id !== user?.id && 
    (lastMessages[u.id] || 
     u.username.toLowerCase().includes(search.toLowerCase()) || 
     u.displayName?.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    const timeA = lastMessages[a.id] ? new Date(lastMessages[a.id].createdAt!).getTime() : 0;
    const timeB = lastMessages[b.id] ? new Date(lastMessages[b.id].createdAt!).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col font-mono">
        <div className="p-4 border-b border-white/10 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-500" />
            <span className="text-sm font-bold text-white tracking-widest uppercase">MESAJLAR</span>
          </div>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Personel ara..."
              className="w-full bg-black border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-xs text-zinc-300 focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversationUsers?.map(u => (
              <button
                key={u.id}
                onClick={() => onSelectChat(u)}
                className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-white/5 transition-colors text-left group border border-transparent hover:border-white/5"
              >
                <UserAvatar user={u as any} className="h-10 w-10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-zinc-300 truncate group-hover:text-white">{u.displayName || u.username}</span>
                    {lastMessages[u.id] && (
                      <span className="text-[10px] text-zinc-600">
                        {format(new Date(lastMessages[u.id].createdAt!), "HH:mm")}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest">
                    {lastMessages[u.id]?.content || `@${u.username}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
  );
}