import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Trash2, Undo2, Image as ImageIcon, Bell } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { UserAvatar } from "./UserAvatar";
import { RankBadge } from "./RankBadge";
import { useToast } from "@/hooks/use-toast";

export function ChatDrawer() {
  const { messages, sendMessage, deleteMessage, restoreMessage } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const lastMessageId = useRef<number | null>(null);

  // Notification logic
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (lastMessageId.current !== null && latestMsg.id > lastMessageId.current && latestMsg.userId !== user?.id) {
        toast({
          title: latestMsg.user.displayName || latestMsg.user.username,
          description: latestMsg.content.substring(0, 50) + (latestMsg.content.length > 50 ? "..." : ""),
        });
      }
      lastMessageId.current = latestMsg.id;
    }
  }, [messages, user?.id, toast]);

  const isAdmin = user?.role === "admin";

  const renderContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = /(@\w+)/g;

    const parts = content.split(/((?:https?:\/\/[^\s]+)|(?:@\w+))/g);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      if (part.match(mentionRegex)) {
        return (
          <span key={i} className="text-yellow-500 font-bold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-l border-white/10 bg-black/95 text-white sm:w-[500px] flex flex-col p-0 h-[100dvh]">
        <SheetHeader className="p-6 border-b border-white/10 bg-zinc-950/50">
          <SheetTitle className="font-mono tracking-widest text-cyan-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-500 animate-pulse rounded-full"></span>
            SOHBET
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 bg-black/80 font-mono">
          <div className="flex flex-col gap-4">
            {messages?.map((msg) => {
              if (msg.isDeleted && !isAdmin) return null;

              return (
                <div key={msg.id} className={`group flex gap-3 ${msg.isDeleted ? 'opacity-50' : ''}`}>
                  <div className="flex-none">
                    <UserAvatar user={msg.user} className="h-8 w-8 rounded-full ring-1 ring-white/10 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-cyan-600 font-bold text-xs truncate max-w-[100px]">
                          {msg.user.displayName || msg.user.username}
                        </span>
                        <RankBadge rank={msg.user.rank} />
                      </div>
                      <span className="text-[10px] text-zinc-600 shrink-0">
                        {format(new Date(msg.createdAt!), "HH:mm:ss")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 w-full group/msg-content">
                      <div className="flex-1 min-w-0">
                        {msg.content && (
                          <div className={`text-sm text-zinc-300 break-words overflow-wrap-anywhere whitespace-pre-wrap leading-relaxed ${msg.isDeleted ? 'line-through text-red-900' : ''}`}>
                            {renderContent(msg.content)}
                          </div>
                        )}
                        {msg.imageUrl && (
                          <div className="relative mt-2 w-full max-w-[300px]">
                            <img 
                              src={msg.imageUrl} 
                              alt="Paylaşılan Görsel" 
                              className="w-full h-auto rounded-sm border border-white/10 max-h-60 object-contain bg-zinc-900/50 block hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(msg.imageUrl!, '_blank')}
                              onLoad={(e) => {
                                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'end' });
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {(isAdmin || msg.userId === user?.id) && (
                        <div className="flex-none shrink-0 self-start">
                          {!msg.isDeleted ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteMessage.mutate(msg.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  restoreMessage.mutate(msg.id);
                                }}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
              placeholder="Mesaj dizisini girin..." 
              className="bg-black border-zinc-800 text-green-500 font-mono placeholder:text-zinc-700 focus:border-green-900 focus:ring-1 focus:ring-green-900/20"
            />
            <div className="flex gap-2">
              <input
                type="file"
                id="chat-image-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // 20MB limit check for base64
                    if (file.size > 20 * 1024 * 1024) {
                      alert("Dosya boyutu çok büyük (Maksimum 20MB)");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      sendMessage.mutate({ 
                        content: input || "Fotoğraf paylaşıldı", 
                        imageUrl: base64String 
                      });
                      setInput("");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white" onClick={() => document.getElementById('chat-image-upload')?.click()}>
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={sendMessage.isPending} className="bg-zinc-800 hover:bg-zinc-700 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
