import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Trash2, Undo2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { UserAvatar } from "./UserAvatar";
import { RankBadge } from "./RankBadge";

export function ChatDrawer() {
  const { messages, sendMessage, deleteMessage, restoreMessage } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage.mutateAsync({ content: input });
    setInput("");
  };

  const isAdmin = user?.role === "admin";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] border-l border-white/10 bg-black/95 text-white sm:w-[600px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-white/10 bg-zinc-950/50">
          <SheetTitle className="font-mono tracking-widest text-cyan-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-500 animate-pulse rounded-full"></span>
            GLOBAL_COMMS_LINK
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6 bg-black/80 font-mono">
          <div className="space-y-4">
            {messages?.map((msg) => {
              if (msg.isDeleted && !isAdmin) return null;

              return (
                <div key={msg.id} className={`group flex gap-3 ${msg.isDeleted ? 'opacity-50' : ''}`}>
                  <div className="flex-shrink-0 pt-1">
                    <UserAvatar user={msg.user} className="h-8 w-8 rounded-none border-none ring-1 ring-white/10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-cyan-600 font-bold text-xs truncate">
                        {msg.user.displayName || msg.user.username}
                      </span>
                      <RankBadge rank={msg.user.rank} />
                      <span className="text-[10px] text-zinc-600">
                        {format(new Date(msg.createdAt!), "HH:mm:ss")}
                      </span>
                    </div>
                    <p className={`text-sm text-zinc-300 break-words leading-relaxed ${msg.isDeleted ? 'line-through text-red-900' : ''}`}>
                      {msg.content}
                    </p>
                  </div>
                  
                  {isAdmin && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                      {msg.isDeleted ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-zinc-500 hover:text-cyan-400"
                          onClick={() => restoreMessage.mutate(msg.id)}
                        >
                          <Undo2 className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-zinc-500 hover:text-red-400"
                          onClick={() => deleteMessage.mutate(msg.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-zinc-950/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter message sequence..." 
              className="bg-black border-zinc-800 text-green-500 font-mono placeholder:text-zinc-700 focus:border-green-900 focus:ring-1 focus:ring-green-900/20"
            />
            <Button type="submit" disabled={sendMessage.isPending} className="bg-zinc-800 hover:bg-zinc-700 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
