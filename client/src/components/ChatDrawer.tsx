import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Trash2, Undo2, Image as ImageIcon, Bell, Star } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { UserAvatar } from "./UserAvatar";
import { RankBadge } from "./RankBadge";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ChatDrawer() {
  const { messages, sendMessage, deleteMessage, restoreMessage } = useChat();
  const { user } = useAuth();
  const { users } = useUsers();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const lastMessageId = useRef<number | null>(null);
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Notification permission logic
  useEffect(() => {
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted");
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === "granted");
        });
      }
    }
  }, []);

  const filteredUsers = useMemo(() => {
    if (!mentionSearch || !users) return [];
    return users.filter(u => 
      u.username.toLowerCase().includes(mentionSearch.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(mentionSearch.toLowerCase()))
    ).slice(0, 5);
  }, [mentionSearch, users]);

  const handleInputChange = (val: string) => {
    setInput(val);
    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1 && (lastAt === 0 || val[lastAt - 1] === " ")) {
      const search = val.slice(lastAt + 1).split(" ")[0];
      setMentionSearch(search);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username: string) => {
    const lastAt = input.lastIndexOf("@");
    const before = input.slice(0, lastAt);
    const after = input.slice(lastAt + 1).split(" ").slice(1).join(" ");
    setInput(before + "@" + username + " " + after);
    setShowMentions(false);
  };

  // Notification logic
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (lastMessageId.current !== null && latestMsg.id > lastMessageId.current && latestMsg.userId !== user?.id) {
        // UI Notification (Toast)
        toast({
          title: latestMsg.user.displayName || latestMsg.user.username,
          description: latestMsg.content.substring(0, 50) + (latestMsg.content.length > 50 ? "..." : ""),
        });

        // Browser Native Notification
        if (hasPermission && document.hidden) {
          try {
            new Notification(latestMsg.user.displayName || latestMsg.user.username, {
              body: latestMsg.content,
              icon: latestMsg.user.avatarUrl || "/favicon.png"
            });
          } catch (e) {
            console.error("Notification error:", e);
          }
        }
      }
      lastMessageId.current = latestMsg.id;
    }
  }, [messages, user?.id, toast, hasPermission]);

  const isAdmin = user?.role === "admin";

  const renderContent = (content: string, isCore?: boolean | null) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = /(@\w+)/g;

    const parts = content.split(/((?:https?:\/\/[^\s]+)|(?:@\w+))/g);
    
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.match(urlRegex)) {
        if (isCore === false || isCore === null) return <span key={i}>{part}</span>;
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:underline break-all relative z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
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
      return <span key={i}>{part}</span>;
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
            {messages?.map((msg, index) => {
              if (msg.isDeleted && !isAdmin) return null;

              const isConsecutive = index > 0 && messages[index - 1].userId === msg.userId && !messages[index - 1].isDeleted;

              return (
                <div key={msg.id} className={`group flex gap-3 ${msg.isDeleted ? 'opacity-50' : ''} ${isConsecutive ? '-mt-2' : ''}`}>
                  <div className="flex-none w-10 relative isolate">
                    {!isConsecutive && (
                      <div className="relative z-0">
                        <UserAvatar user={msg.user as any} className="h-8 w-8 rounded-full ring-1 ring-white/10 shrink-0" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    {!isConsecutive && (
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <button 
                            type="button"
                            onClick={() => (window as any).openProfileDrawer?.(msg.user)}
                            className="hover:underline text-left"
                          >
                            <span className={`font-bold text-xs truncate max-w-[100px] ${msg.user.role === 'admin' ? 'text-red-500' : 'text-cyan-600'}`}>
                              {msg.user.displayName || msg.user.username}
                            </span>
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-600 shrink-0">
                          {format(new Date(msg.createdAt!), "HH:mm:ss")}
                        </span>
                      </div>
                    )}
                <div className="flex items-start gap-2 w-full group/msg-content">
                  <div className="flex-1 min-w-0">
                    {msg.content && (
                      <div className={`text-sm text-zinc-300 break-all overflow-wrap-anywhere whitespace-pre-wrap leading-relaxed ${msg.isDeleted ? 'line-through text-red-900' : ''}`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {renderContent(msg.content, msg.user.isCore as boolean | null)}
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
                        <div className="flex-none shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                          {!msg.isDeleted ? (
                            <div className="flex gap-1">
                              {user?.id !== msg.user.id && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if ((window as any).setSelectedUserForDM) {
                                      (window as any).setSelectedUserForDM(msg.user);
                                    }
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              )}
                              {(isAdmin || msg.userId === user?.id) && (
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
                              )}
                            </div>
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

        <div className="p-4 border-t border-white/10 bg-zinc-950/50 relative">
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-900 border border-white/10 rounded-md shadow-xl overflow-hidden z-50">
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 border-b border-white/5 last:border-0"
                  onClick={() => insertMention(u.username)}
                >
                  <UserAvatar user={u as any} className="h-5 w-5 rounded-full ring-1 ring-white/10 shrink-0" />
                  <span className="text-zinc-300 font-mono">{u.displayName || u.username}</span>
                  <span className="text-[10px] text-zinc-600 ml-auto">@{u.username}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
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
